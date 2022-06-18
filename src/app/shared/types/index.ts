export type User = {
  id: number,
  username: string,
  email: string
}

export type UserPage = {
  content: User[],
  page: number,
  size: number,
  totalPages: number
}

export type LoggedInUser = User & { isLoggedIn: boolean}