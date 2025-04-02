import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router

function Home() {
    return (
        <section id="featured-services" className="py-5 bg-light">
            <div className="container">
                <div className="row g-4">
                    <div className="col-lg-4">
                        <Link to="/javascript" className="card text-center shadow border-0 p-4 text-decoration-none">
                            <div className="mb-3">
                                <i className="bi bi-activity fs-1 text-primary"></i>
                            </div>
                            <h4 className="text-dark">JavaScript</h4>
                            <p className="text-muted">JavaScript is a versatile, high-level programming language commonly used for building interactive websites, front-end applications, and server-side logic with frameworks like Node.js.</p>
                        </Link>
                    </div>

                    <div className="col-lg-4">
                        <Link to="/csharp" className="card text-center shadow border-0 p-4 text-decoration-none">
                            <div className="mb-3">
                                <i className="bi bi-bounding-box-circles fs-1 text-success"></i>
                            </div>
                            <h4 className="text-dark">C#</h4>
                            <p className="text-muted">C# is a modern, object-oriented programming language developed by Microsoft, used extensively for building Windows applications, games (via Unity), and web services with ASP.NET.</p>
                        </Link>
                    </div>

                    <div className="col-lg-4">
                        <Link to="/python" className="card text-center shadow border-0 p-4 text-decoration-none">
                            <div className="mb-3">
                                <i className="bi bi-calendar4-week fs-1 text-danger"></i>
                            </div>
                            <h4 className="text-dark">Python</h4>
                            <p className="text-muted">Python is a powerful, high-level programming language known for its readability and versatility, widely used in web development, data analysis, artificial intelligence, scientific computing, and more.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home;
