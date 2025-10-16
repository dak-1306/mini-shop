//Layout
import Header from "../layout/header";
import Footer from "../layout/Footer";
import Button from "../layout/Button";

function Profile() {
  return (
    <>
      <Header />
      <div className="w-3/4  mx-auto mt-8 mb-8 bg-gray-100 p-4 rounded shadow min-h-screen flex justify-between items-start ">
        <div className="bg-white p-6 rounded shadow-md w-1/2 mr-4 flex justify-center items-center">
          <h1 className="text-2xl font-bold mb-4">img profile</h1>
          <img src="" alt="" />
        </div>
        <div className="bg-white p-6 rounded shadow-md w-1/2 ">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <p className="mb-2">
            <span className="font-bold">Name:</span> John Doe
          </p>
          <p className="mb-2">
            <span className="font-bold">Email:</span> john.doe@example.com
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
export default Profile;
