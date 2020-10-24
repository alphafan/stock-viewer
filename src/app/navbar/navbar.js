import React from 'react';
import { MDBNavbar, MDBNavbarBrand } from 'mdbreact';

const NavbarComponent = () => (
  <MDBNavbar color='primary-color' dark expand='md'>
    <MDBNavbarBrand>
      <strong className='white-text'>Stock Trends Analysis</strong>
    </MDBNavbarBrand>
  </MDBNavbar>
);

export default NavbarComponent;