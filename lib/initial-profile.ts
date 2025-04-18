import { currentUser, auth } from "@clerk/nextjs/server";
import { db } from "./db";

export const initialProfile = async () => {
  const user = await currentUser();

  // console.log(`user`, user);
  // console.log(`user*****==`, user);
  const { userId, redirectToSignIn } = await auth();
  if (!user) {
    return redirectToSignIn();
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (profile) {
    return profile;
  }

  const newProfile = await db.profile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      imageUrl: user.imageUrl,
    },
  });

  return newProfile;
};
