export class SocialNetworkQueries {
  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
    this.data = {};
  }

  async findPotentialLikes({ minimalScore } = {}) {
    try {
      const newData = await this.fetchCurrentUser();

      this.data = newData;
    } catch (err) {
      if (!this.data) {
        // No cached data
        return { books: [] };
      }
    }

    const booksFriendsLikesCount = {};

    this.data.friends?.forEach((friend) => {
      friend.likes?.books.forEach((friendBook) => {
        if (booksFriendsLikesCount[friendBook]) {
          booksFriendsLikesCount[friendBook] =
            booksFriendsLikesCount[friendBook] + 1;
        } else {
          booksFriendsLikesCount[friendBook] = 1;
        }
      });
    });

    const friendsLength = this.data.friends?.length ?? 0;

    const requiredMinimalScore = Math.floor(minimalScore * friendsLength);

    const recomendedBooksWithRate = Object.keys(booksFriendsLikesCount)
      .map((key) => ({ title: key, likeCount: booksFriendsLikesCount[key] }))
      .filter(
        (bookAndLikeCount) =>
          bookAndLikeCount.likeCount > requiredMinimalScore &&
          !this.data.likes.books.find(
            (userLikedBook) => userLikedBook === bookAndLikeCount.title
          )
      );

    recomendedBooksWithRate.sort((book1, book2) => {
      const likeCountDiff = book2.likeCount - book1.likeCount;
      if (book2.likeCount - book1.likeCount !== 0) {
        return likeCountDiff;
      }

      return book1.title.localeCompare(book2.title, "en", {
        sensitivity: "base",
      });
    });

    return Promise.resolve({
      books: recomendedBooksWithRate.map((bookAndRate) => bookAndRate.title),
    });
  }
}
