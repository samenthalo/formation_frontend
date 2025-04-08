import React from 'react';
import { GraduationCap, Bell, UserCircle } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16">
        <div className="flex items-center">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-montserrat font-bold">Formation Pro</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-6 w-6 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <UserCircle className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
