import React from 'react';
import Footer from '../components/shared/Footer';
import NavBar from '../components/shared/NavBar';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <>
      <>
        <NavBar />
      </>
      <main className='flex min-h-screen flex-col'>
        <Outlet />
      </main>
      <>
        <Footer />
      </>
    </>
  );
};

export default UserLayout;
