export const registerUser = async (user: User) => {
  await useTransaction(() => {
    userRepo.save(user);
  });
};
