import React from "react";

export default function Footer() {
    return (
        <footer className="bg-dark text-light py-5">
            <div className="container">
                <div className="row gy-4">
                    {/* О компании */}
                    <div className="col-lg-5 col-md-12">
                        <a href="/" className="d-flex align-items-center mb-3 text-light text-decoration-none">
                            <h2 className="sitename text-success m-0">Pudge</h2>
                        </a>
                        <p className="text-muted">
                            Cras fermentum odio eu feugiat lide par naso tierra. Justo eget nada terra videa magna derita
                            valies darta donna mare fermentum iaculis eu non diam phasellus.
                        </p>
                        <div className="d-flex mt-3">
                            <a href="#" className="btn btn-outline-light btn-sm rounded-circle me-2">
                                <i className="bi bi-twitter"></i>
                            </a>
                            <a href="#" className="btn btn-outline-light btn-sm rounded-circle me-2">
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="#" className="btn btn-outline-light btn-sm rounded-circle me-2">
                                <i className="bi bi-instagram"></i>
                            </a>
                            <a href="#" className="btn btn-outline-light btn-sm rounded-circle">
                                <i className="bi bi-linkedin"></i>
                            </a>
                        </div>
                    </div>

                    {/* Полезные ссылки */}
                    <div className="col-lg-2 col-6">
                        <h4 className="text-success">Useful Links</h4>
                        <ul className="list-unstyled">
                            <li><a href="#" className="text-light text-decoration-none">Home</a></li>
                            <li><a href="#" className="text-light text-decoration-none">About us</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Services</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Terms of service</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Privacy policy</a></li>
                        </ul>
                    </div>

                    {/* Услуги */}
                    <div className="col-lg-2 col-6">
                        <h4 className="text-success">Our Services</h4>
                        <ul className="list-unstyled">
                            <li><a href="#" className="text-light text-decoration-none">Web Design</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Web Development</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Product Management</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Marketing</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Graphic Design</a></li>
                        </ul>
                    </div>

                    {/* Контакты */}
                    <div className="col-lg-3 col-md-12">
                        <h4 className="text-success">Contact Us</h4>
                        <p>A108 Adam Street</p>
                        <p>New York, NY 535022</p>
                        <p>United States</p>
                        <p className="mt-3"><strong>Phone:</strong> +1 5589 55488 55</p>
                        <p><strong>Email:</strong> info@example.com</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
