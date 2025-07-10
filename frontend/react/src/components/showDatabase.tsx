const apiUrl = import.meta.env.VITE_API_BASE_URL || "api";

const showDatabase = async () => {
  console.log("Fetching all users and otps from the database...");
  let res = await fetch(apiUrl + "/users/allInfo");
  let data = await res.json();
  console.log(data);
  console.log("Fetching all tournaments from the database...");
  res = await fetch(apiUrl + "/tournaments/all");
  data = await res.json();
  console.log(data);
};

export default showDatabase;
