import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  return (
    <div className="admin-layout">

      {/* Admin Sidebar + Mobile Header */}
      <AdminSidebar />

      {/* Main Page Area */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        /* MAIN ADMIN LAYOUT */

        .admin-layout {
          min-height: 100vh;
          width: 100%;
          background: #020617;
          color: #FFFFFF;
          overflow-x: hidden;
        }

        .admin-main {
          min-height: 100vh;
          margin-left: 260px;
          width: calc(100% - 260px);
          box-sizing: border-box;
          padding: 35px;
        }

        .admin-content {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          box-sizing: border-box;
        }


        /* TABLET */

        @media (max-width: 1000px) {

          .admin-main {
            margin-left: 0;
            width: 100%;
            padding: 25px;
          }

        }


        /* MOBILE */

        @media (max-width: 768px) {

          .admin-main {
            margin-left: 0;
            width: 100%;
            padding: 135px 16px 25px 16px;
          }

          .admin-content {
            width: 100%;
            max-width: 100%;
          }

        }


        /* SMALL PHONES */

        @media (max-width: 480px) {

          .admin-main {
            padding: 130px 12px 20px 12px;
          }

        }


        /*  VERY SMALL PHONES */

        @media (max-width: 360px) {

          .admin-main {
            padding: 125px 10px 20px 10px;
          }

        }

      `}</style>
    </div>
  );
}

export default AdminLayout;