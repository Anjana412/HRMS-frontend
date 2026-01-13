const Navbar = ({ role, companyName = "ABC COMPANY", userName = "Anjana" }) => {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      
      {/* Left: Company Name */}
      <div className="flex items-center gap-3">
        <div className="text-slate-900 font-extrabold text-2xl italic ">{companyName}</div>
      </div>

      {/* Right: Role + Profile */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <span className="px-3 py-1 text-sm rounded-full bg-slate-200 text-slate-900 capitalize font-medium">
          {role}
        </span>

        {/* Profile Circle */}
        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold cursor-pointer">
          {userName[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
