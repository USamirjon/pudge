import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Container } from 'react-bootstrap';

function Header() {
    return (
        <Navbar bg="light" expand="lg" fixed="top" className="shadow-sm">
            <Container>
                <Navbar.Brand href="/home" className="fw-bold fs-4">Pudge</Navbar.Brand>

            </Container>
        </Navbar>
    );
}

export default Header;
