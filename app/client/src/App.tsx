import { NavBar } from "@/components/app/nav-bar";
import { TopBar } from "@/components/app/top-bar";
import { Outlet } from "react-router-dom";


function App() {
  return (
    <div className="flex flex-col h-screen" >
      <TopBar />
      <div className="m-4 pb-32 h-full overflow-scroll"  >
        <Outlet />
      </div>
      <NavBar />
    </div>
  )
}

export default App
