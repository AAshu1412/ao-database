import { NavLink } from "react-router-dom";
import { ConnectButton } from "@arweave-wallet-kit/react";

export default function Navbar() {
  return (
    <nav>
      <div className="h-24 grid grid-cols-[5rem_1fr_4fr_1fr_5rem] bg-orange-600">
        <div className="col-start-2 col-span-1 flex flex-row justify-center items-center text-4xl">
          <p>AO-Database</p>
        </div>
        <div className="col-start-3 col-span-1 text-xl">
          <ul className="h-24 flex flex-row justify-center items-center gap-10 ">
            <li>
              <NavLink to="/">Front</NavLink>
            </li>
            <li>
              <NavLink to="/home">Home</NavLink>
            </li>
            <li>
              <NavLink to="/services">Services</NavLink>
            </li>
            <li></li>
          </ul>
        </div>
        <div className="col-start-4 col-span-1 flex flex-row justify-center items-center">
          <ConnectButton
            profileModal={true}
            showBalance={false}
            showProfilePicture={true}
          />
        </div>
      </div>
    </nav>
  );
}
