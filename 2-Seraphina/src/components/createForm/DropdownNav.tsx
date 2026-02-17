export const DropdownNav = () => {
    return (
      <div className="relative dropdown-wrapper">
        {/* Trigger */}
        <div className="button button-primary text-2xl font-normal button-sm w-36 flex justify-center cursor-pointer">
          Jimmy
        </div>
  
        {/* Dropdown */}
        <div className="dropdown-menu absolute top-full left-0 mt-4 w-56 bg-white text-primary rounded-3xl p-6 space-y-4 shadow-xl">
          <button className="block text-left text-2xl font-medium hover:opacity-70 transition">
            Alejandro
          </button>
          <button className="block text-left text-2xl font-medium hover:opacity-70 transition">
            Luiz
          </button>
          <button className="block text-left text-2xl font-medium hover:opacity-70 transition">
            Javier
          </button>
          <button className="block text-left text-2xl font-medium hover:opacity-70 transition">
            Lucia
          </button>
        </div>
      </div>
    );
  };
  