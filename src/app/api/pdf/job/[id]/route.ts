import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { cookies } from 'next/headers';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, props: { params: Params }) {
    try {
        const params = await props.params;
        const jobId = params.id;
        
        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const url = new URL(request.url);
        const origin = url.origin;

        // Extract session cookie to bypass login page inside Puppeteer
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Unauthorized: Session required to generate PDF. Please login first.' }, { status: 401 });
        }

        // Launch Chromium
        const browser = await puppeteer.launch({
            headless: true, // Use headless=true in newer puppeteer versions
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set the session cookie so the browser is authenticated
        await page.setCookie({
            name: 'session',
            value: sessionCookie.value,
            domain: url.hostname,
            path: '/',
        });

        const isEstimate = url.searchParams.get('type') === 'estimate';

        // Navigate to the secure print page
        const printUrl = isEstimate 
            ? `${origin}/dashboard/jobs/${jobId}/estimate`
            : `${origin}/print/job/${jobId}`;
        await page.goto(printUrl, { waitUntil: 'networkidle0' });

        // Hide any elements that shouldn't appear in the PDF (like a web print button)
        // (Assuming standard print layout handles most of this, but we force media type to 'print')
        await page.emulateMediaType('print');

        // Generate the PDF Buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();

        // Return the actual file as a download
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="GaragePro-Invoice-${jobId}.pdf"`,
            },
        });
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Failed to generate PDF on the server. Make sure puppeteer is installed.' }, { status: 500 });
    }
}
