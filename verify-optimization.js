
const db = require('./dist/lib/db').default;
const { updateJobTotals } = require('./dist/lib/job-utils');

async function test() {
    try {
        console.log('Testing optimized updateJobTotals...');
        // We'll test on a known job or create a dummy one if needed
        // For now, just checking the syntax of the new query by running it
        // jobId 1 is usually present in most dev setups
        await updateJobTotals(1);
        console.log('✅ updateJobTotals executed successfully (syntax check passed)');
    } catch (err) {
        console.error('❌ updateJobTotals verification failed:', err);
    }
}

test();
