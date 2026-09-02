import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
      }}
    >
      <Sidebar />

      <main className="student-main-content">
        <Outlet />
      </main>

      <style>
        {`

        .student-main-content {
          margin-left: 260px;

          min-height: 100vh;

          padding: 35px;

          box-sizing: border-box;
        }


        @media (max-width: 768px) {

          .student-main-content {
            margin-left: 0 !important;

            /*
              Mobile header = 92px
              Extra spacing = 18px
            */

            padding: 110px 20px 30px !important;

            box-sizing: border-box;
          }

        }


        @media (max-width: 400px) {

          .student-main-content {
            padding: 100px 16px 25px !important;
          }

        }

        `}
      </style>
    </div>
  );
}

export default MainLayout;
