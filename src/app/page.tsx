import Image from "next/image";
import Link from "next/link";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  ArrowRight,
  Car
} from "lucide-react";

export default function Home() {
  return (
    <div className="home-container" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg text-white">
              <Car size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">GaragePro</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Services</a>
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">About</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-600 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              DASHBOARD
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-6 tracking-wide uppercase">
              <Zap size={14} />
              Fast & Reliable Auto Repair
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-[1.1]">
              Premium Car Care <br />
              <span className="text-primary-600">Without the Premium Price.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
              Professional mechanical services, specialized tuning, and reliable maintenance for all vehicle types. We use state-of-the-art diagnostic tools to keep you safe on the road.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="tel:+911234567890" 
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-lg font-bold hover:bg-gray-800 transition-all shadow-xl"
              >
                <Phone size={20} />
                Call Now
              </a>
              <a 
                href="#services" 
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl text-lg font-bold hover:border-primary-600 hover:text-primary-600 transition-all"
              >
                View Services
                <ArrowRight size={20} />
              </a>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <CheckCircle2 size={18} className="text-green-500" />
                Expert Mechanics
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <CheckCircle2 size={18} className="text-green-500" />
                Quick Turnaround
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <CheckCircle2 size={18} className="text-green-500" />
                Genuine Parts
              </div>
            </div>
          </div>
        </div>

        {/* Hero Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <div className="relative w-full h-full transform translate-x-12 translate-y-12 shadow-2xl rounded-l-[40px] overflow-hidden">
            <Image 
              src="/garage_hero_modern_1776444272330.png" 
              alt="Premium Garage Interior" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent z-10" />
        </div>
      </header>

      {/* Stats/Quick Info */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Working Hours</h4>
                <p className="text-sm text-gray-500">Mon - Sat: 9 AM - 7 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Our Location</h4>
                <p className="text-sm text-gray-500">Main Road, City Center</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Certified Repair</h4>
                <p className="text-sm text-gray-500">Government Authorized</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Repair & Diagnostic Services</h2>
            <p className="text-gray-600 text-lg">We offer a wide range of automobile repairs. All our services are carried out by skilled professionals using genuine spare parts.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Full Engine Diagnostic', desc: 'Comprehensive scan and diagnostic to identify hidden issues.', icon: Zap },
              { title: 'Brake System Service', desc: 'Pad replacement, rotor resurfacing, and fluid flush.', icon: ShieldCheck },
              { title: 'Air Conditioning Repair', desc: 'Gas recharging, leak detection, and compressor repair.', icon: Wrench },
              { title: 'Electrical & Battery', desc: 'Electrical troubleshooting, battery testing, and replacement.', icon: Zap },
              { title: 'Suspension & Steering', desc: 'Shock replacement, wheel alignment, and power steering repairs.', icon: Wrench },
              { title: 'Scheduled Maintenance', desc: 'Oil changes, filter replacements, and interval tune-ups.', icon: Clock },
            ].map((service, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white border border-gray-100 hover:border-primary-600 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <service.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">{service.desc}</p>
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary-600 font-bold group-hover:gap-3 transition-all">
                  Book In-App <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto bg-primary-600 rounded-[40px] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 italic">Ready to get back on the road?</h2>
            <p className="text-xl text-primary-100 mb-12">Visit us today or book an appointment through our digital dashboard for faster service.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="tel:+911234567890" className="px-10 py-5 bg-white text-primary-600 rounded-2xl text-xl font-bold hover:bg-primary-50 transition-all shadow-lg">
                Call Us Now
              </a>
              <Link href="/login" className="px-10 py-5 bg-primary-500 text-white border-2 border-primary-400 rounded-2xl text-xl font-bold hover:bg-primary-400 transition-all">
                Login to Book
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-2 text-white">
            <Car size={32} className="text-primary-500" />
            <span className="text-2xl font-bold tracking-tight">GaragePro</span>
          </div>
          <div>
            <p className="text-sm">© 2026 Gorkasha Car Care Center. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="/login" className="hover:text-white transition-colors">Admin Login</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/911234567890" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle size={32} fill="white" />
      </a>
    </div>
  );
}
