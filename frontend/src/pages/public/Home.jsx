import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Calendar,
  Car,
  Scissors,
  Shirt,
  Sparkles,
} from "lucide-react";
import "../../styles/Home.css";

function Home() {
  const services = [
    { title: "Salon", icon: Sparkles, description: "Premium hair & beauty" },
    { title: "Barbershop", icon: Scissors, description: "Expert grooming" },
    { title: "Car Wash", icon: Car, description: "Complete auto detailing" },
    { title: "Laundry Hub", icon: Shirt, description: "Fresh & clean" },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "Verified Providers",
      description:
        "Every provider is thoroughly verified before appearing on our platform.",
    },
    {
      icon: Calendar,
      title: "Real-time Booking",
      description:
        "Book instantly and receive live updates on your service status.",
    },
    {
      icon: Star,
      title: "Trusted Reviews",
      description:
        "Authentic customer ratings and verified reviews for every service.",
    },
  ];

  return (
    <div className="home-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/">
            <h1 className="logo">MultiServe</h1>
          </Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-blur-1" />
          <div className="hero-blur-2" />
        </div>

        <div className="hero-grid">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">
              <Star size={14} />
              Trusted Service Marketplace
            </div>

            <h1 className="hero-title">
              Book Trusted
              <span className="hero-title-gradient">Local Services</span>
            </h1>

            <p className="hero-description">
              Discover verified salons, car washes, barbershops, laundry hubs
              and more — all in one premium booking platform with real-time
              availability.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="btn-hero-primary">
                Start Booking
                <ArrowRight size={18} className="arrow-icon" />
              </Link>
              <Link to="/services" className="btn-hero-secondary">
                Browse Services
              </Link>
            </div>
          </motion.div>

          {/* RIGHT CONTENT - SERVICE GRID */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="service-card"
          >
            <div className="service-card-inner">
              <div className="service-header">
                <div>
                  <p className="service-welcome-text">Welcome Back</p>
                  <h3 className="service-welcome-title">MultiServe</h3>
                </div>
                <div className="service-avatar" />
              </div>

              <div className="service-grid">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div key={index} className="service-item">
                      <div className="service-icon">
                        <Icon />
                      </div>
                      <h4 className="service-title">{service.title}</h4>
                      <p className="service-desc">{service.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="service-stats">
                <div className="stat-item">
                  <p className="stat-value">500+</p>
                  <p className="stat-label">Providers</p>
                </div>
                <div className="stat-item">
                  <p className="stat-value">4.9</p>
                  <p className="stat-label">Rating</p>
                </div>
                <div className="stat-item">
                  <p className="stat-value">10k+</p>
                  <p className="stat-label">Bookings</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose MultiServe</h2>
          <p className="section-subtitle">
            A modern service marketplace built for customers and providers
            alike.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="feature-card"
              >
                <div className="feature-icon">
                  <Icon />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="howitworks-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Three simple steps to get your services done
          </p>
        </div>

        <div className="steps-grid">
          {[
            {
              step: "01",
              title: "Choose Service",
              desc: "Browse and select from trusted local providers",
            },
            {
              step: "02",
              title: "Book Instantly",
              desc: "Pick a time that works for you with real-time availability",
            },
            {
              step: "03",
              title: "Get It Done",
              desc: "Relax while professionals handle the rest",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="step-item"
            >
              <div className="step-number">{item.step}</div>
              <h3 className="step-title">{item.title}</h3>
              <p className="step-description">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="cta-card"
        >
          <div className="cta-overlay" />
          <div className="cta-content">
            <h2 className="cta-title">Ready To Get Started?</h2>
            <p className="cta-description">
              Join MultiServe today and discover premium local services with
              real-time booking and secure payments.
            </p>
            <Link to="/register" className="btn-cta">
              Create Free Account
              <ArrowRight size={18} className="arrow-icon" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Home;
