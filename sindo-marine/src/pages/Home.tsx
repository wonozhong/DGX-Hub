import React from 'react';
import Hero from '../components/home/Hero';
import Overview from '../components/home/Overview';
import Features from '../components/home/Features';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Overview />
      <Features />
    </>
  );
};

export default Home;
