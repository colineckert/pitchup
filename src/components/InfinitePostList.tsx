import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { ProfileImage } from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./LoadingSpinner";

type Post = {
  id: string;
  content: string;
  type: "SOCIAL" | "GAME_RECAP" | "GAME_INVITE";
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  user: {
    id: string;
    image: string | null;
    name: string | null;
  };
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
};

type InfinitePostListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean | undefined;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
};

export function InfinitePostList({
  posts,
  isError,
  isLoading,
  fetchNewPosts,
  hasMore = false,
}: InfinitePostListProps) {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <h1>Error...</h1>;

  if (posts == null || posts.length === 0) {
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">No Posts</h2>
    );
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchNewPosts}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
      >
        {/* TODO: remove this test post */}
        <GameRecapListItem
          key="test-recap"
          type="GAME_RECAP"
          user={{
            id: "test",
            image: null,
            name: "Test User",
          }}
          id="test-recap"
          content=""
          homeTeamId="Arsenal"
          awayTeamId="Chelsea"
          homeScore={2}
          awayScore={1}
          createdAt={new Date()}
          likeCount={1}
          likedByMe={false}
        />
        {posts.map((post) => {
          if (post.type === "GAME_RECAP") {
            return <GameRecapListItem key={post.id} {...post} />;
          }
          return <PostListItem key={post.id} {...post} />;
        })}
      </InfiniteScroll>
    </ul>
  );
}

function getFormattedDate(date: Date, type: "short" | "long") {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: type,
  }).format(date);
}

function PostListItem({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
}: Post) {
  const trpcUtils = api.useUtils();
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: async ({ addedLike }) => {
      const updateData: Parameters<
        typeof trpcUtils.post.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        const coundModifier = addedLike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === id) {
                  return {
                    ...post,
                    likeCount: post.likeCount + coundModifier,
                    likedByMe: addedLike,
                  };
                }

                return post;
              }),
            };
          }),
        };
      };

      trpcUtils.post.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.post.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateData,
      );
      trpcUtils.post.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateData,
      );
    },
  });

  function handleToggleLike() {
    toggleLike.mutate({ id });
  }

  return (
    <li key={id} className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {getFormattedDate(createdAt, "short")}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <HearButton
          onClick={handleToggleLike}
          isLoading={toggleLike.isLoading}
          likedByMe={likedByMe}
          likeCount={likeCount}
        />
      </div>
    </li>
  );
}

function GameRecapListItem({
  id,
  user,
  homeTeamId,
  awayTeamId,
  homeScore,
  awayScore,
  createdAt,
  likeCount,
  likedByMe,
}: Post) {
  console.log({ homeTeamId, awayTeamId });

  const trpcUtils = api.useUtils();
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: async ({ addedLike }) => {
      const updateData: Parameters<
        typeof trpcUtils.post.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        const coundModifier = addedLike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === id) {
                  return {
                    ...post,
                    likeCount: post.likeCount + coundModifier,
                    likedByMe: addedLike,
                  };
                }

                return post;
              }),
            };
          }),
        };
      };

      trpcUtils.post.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.post.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateData,
      );
      trpcUtils.post.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateData,
      );
    },
  });

  function handleToggleLike() {
    toggleLike.mutate({ id });
  }

  // TODO: get team names from id

  // TODO: try using a grid layout for this
  return (
    <li key={id} className="flex gap-4 border-b px-4 py-4">
      <div className="flex flex-grow flex-col">
        <span className="text-gray-500 self-center">
          {getFormattedDate(createdAt, "long")}
        </span>
        <div className="flex flex-row justify-center gap-14 py-4">
          <Link
            href={`/`}
            className="font-bold hover:underline focus-visible:underline"
          >
            Arsenal
          </Link>
          <div />
          <Link
            href={`/`}
            className="font-bold hover:underline focus-visible:underline"
          >
            Chelsea
          </Link>
          {/* TODO: add images for teams */}
        </div>
        <div className="flex flex-row justify-center gap-20">
          <span className="font-bold">{homeScore}</span>
          <span className="text-gray-500">-</span>
          <span className="font-bold">{awayScore}</span>
        </div>
        <div className="self-end">
          <HearButton
            onClick={handleToggleLike}
            isLoading={toggleLike.isLoading}
            likedByMe={likedByMe}
            likeCount={likeCount}
          />
        </div>
      </div>
    </li>
  );
}

type HeartButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  likedByMe: boolean;
  likeCount: number;
};

function HearButton({
  onClick,
  isLoading,
  likedByMe,
  likeCount,
}: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );
  }

  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
        likedByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
      }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`duration-200, transition-colors ${
            likedByMe
              ? "fill-red-500"
              : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
          }`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
}

