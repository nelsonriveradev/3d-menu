"use client";
import { useUser } from "@clerk/nextjs";

export default function Admin() {
  const { isLoaded, user } = useUser();
  console.log(user);
  return (
    <div>
      <h1>Admin Page</h1>
      {isLoaded ? (
        <p>{user?.emailAddresses[0]?.emailAddress}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
