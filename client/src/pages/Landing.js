import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, ease: "easeOut" }
    };

    const staggerContainer = {
        initial: {},
        whileInView: { transition: { staggerChildren: 0.1 } },
        viewport: { once: true }
    };

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="navbar-premium">
                <div className="container d-flex justify-content-between align-items-center py-3">
                    <div className="navbar-logo">
                        <span className="logo-icon">S</span>
                        <span className="logo-text">SLOIS</span>
                    </div>
                    <div className="navbar-links d-none d-md-flex gap-4">
                        <a href="#features">Features</a>
                        <a href="#about">About</a>
                        <a href="#contact">Contact</a>
                    </div>
                    <div className="navbar-actions">
                        <button className="btn-premium-outline me-2" onClick={() => navigate('/signin')}>Login</button>
                        <button className="btn-premium" onClick={() => navigate('/signup')}>Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-blobs">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                </div>
                <div className="container text-center pt-5">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="badge-premium mb-3">Next Generation Education Platform</span>
                    </motion.div>
                    <motion.h1 
                        className="hero-title"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Master Your Academic <span className="text-gradient">Journey</span> With Ease
                    </motion.h1>
                    <motion.p 
                        className="hero-subtitle mb-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Empowering students and faculty with a unified platform for tracking progress, 
                        managing records, and predicting outcomes.
                    </motion.p>
                    <motion.div 
                        className="hero-buttons d-flex justify-content-center gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <button className="btn-premium px-5 py-3 fs-5" onClick={() => navigate('/signup')}>
                            Join SLOIS Today
                        </button>
                        <button className="btn-premium-outline px-5 py-3 fs-5">
                            Watch Video
                        </button>
                    </motion.div>
                </div>

                <motion.div 
                    className="hero-dashboard-mockup mt-5 container overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    <div className="mockup-frame shadow-lg">
                        <div className="mockup-content">
                            <div className="mockup-header d-flex gap-2 p-3">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                            <div className="mockup-body p-4">
                                <div className="row g-4">
                                    <div className="col-4"><div className="skeleton-bar h-100 mb-3" style={{height: '100px'}}></div></div>
                                    <div className="col-8">
                                        <div className="skeleton-bar w-75 mb-3"></div>
                                        <div className="skeleton-bar w-50 mb-3"></div>
                                        <div className="skeleton-bar w-100"></div>
                                    </div>
                                    <div className="col-12"><div className="skeleton-bar w-100" style={{height: '150px'}}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section py-5">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h2 className="section-title">Powerful Features</h2>
                        <p className="section-subtitle">Everything you need to succeed in your academic life</p>
                    </div>

                    <motion.div 
                        className="row g-4"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                    >
                        <div className="col-md-4">
                            <motion.div className="feature-card glass-card" variants={fadeInUp}>
                                <div className="feature-icon mb-4">
                                    <i className="bi bi-graph-up-arrow"></i>
                                </div>
                                <h3>Performance Tracking</h3>
                                <p>Real-time insights into your grades and attendance history.</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div className="feature-card glass-card" variants={fadeInUp}>
                                <div className="feature-icon mb-4">
                                    <i className="bi bi-robot"></i>
                                </div>
                                <h3>AI Predictions</h3>
                                <p>Predict your CGPA and future outcomes using advanced ML models.</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div className="feature-card glass-card" variants={fadeInUp}>
                                <div className="feature-icon mb-4">
                                    <i className="bi bi-shield-check"></i>
                                </div>
                                <h3>Secure Management</h3>
                                <p>Role-based access control to keep your academic data safe.</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section py-5">
                <div className="container py-5 text-center">
                    <div className="row g-4 justify-content-center">
                        <div className="col-6 col-md-3">
                            <div className="stat-item">
                                <h2>10k+</h2>
                                <p>Students</p>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="stat-item">
                                <h2>500+</h2>
                                <p>Faculty</p>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="stat-item">
                                <h2>99%</h2>
                                <p>Accuracy</p>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="stat-item">
                                <h2>24/7</h2>
                                <p>Support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-premium py-5">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="navbar-logo mb-4">
                                <span className="logo-icon">S</span>
                                <span className="logo-text">SLOIS</span>
                            </div>
                            <p className="text-muted">Innovating education management through technology and data-driven insights.</p>
                        </div>
                        <div className="col-lg-2 offset-lg-2">
                            <h5>Platform</h5>
                            <ul className="list-unstyled">
                                <li><a href="#features">Features</a></li>
                                <li><a href="#">Security</a></li>
                                <li><a href="#">Roadmap</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-2">
                            <h5>Company</h5>
                            <ul className="list-unstyled">
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Careers</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-2">
                            <h5>Support</h5>
                            <ul className="list-unstyled">
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Contact</a></li>
                                <li><a href="#">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                    <hr className="my-5" />
                    <div className="d-flex justify-content-between flex-wrap gap-3">
                        <p className="mb-0 text-muted">© 2024 SLOIS Platform. All rights reserved.</p>
                        <div className="social-links d-flex gap-3">
                            <a href="#"><i className="bi bi-twitter"></i></a>
                            <a href="#"><i className="bi bi-linkedin"></i></a>
                            <a href="#"><i className="bi bi-github"></i></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
