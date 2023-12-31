import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import ErrorPage from "next/error";
// import { useSession } from "next-auth/react";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import Link from "next/link";
import { IconHoverEffect } from "~/components/IconHoverEffect";
import { HiArrowLeft } from "react-icons/hi";
import { ProfileImage } from "~/components/ProfileImage";
// import { InfinitePostList } from "~/components/InfinitePostList";
// import { Button } from "~/components/Button";

const TeamPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  id,
}) => {
  const { data: team } = api.team.getById.useQuery({ id });
  // const posts = api.post.infiniteProfileFeed.useInfiniteQuery(
  //   { userId: id },
  //   { getNextPageParam: (lastPage) => lastPage.nextCursor },
  // );

  if (team?.name == null) return <ErrorPage statusCode={404} />;

  return (
    <>
      <Head>
        <title>{`Pitchup - ${team.name}`}</title>
      </Head>
      <header className="sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2">
        <Link href="/teams" className="mr-2">
          <IconHoverEffect>
            <HiArrowLeft className="h-6 w-6" />
          </IconHoverEffect>
        </Link>
        <ProfileImage src={team.image} className="flex-shrink-0" />
        <div className="ml-2 flex-grow">
          <h1 className="text-lg font-bold">{team.name}</h1>
          {/* <div className="text-gray-500">
            {profile.postsCount}{" "}
            {getPlural(profile.postsCount, "Post", "Posts")} -{" "}
            {profile.followersCount}{" "}
            {getPlural(profile.followersCount, "Follower", "Followers")} -{" "}
            {profile.followsCount} Following
          </div> */}
        </div>
      </header>
      <main>
        {/* <InfinitePostList
          posts={[]}
          isError={posts.isError}
          isLoading={posts.isLoading}
          hasMore={posts.hasNextPage}
          fetchNewPosts={posts.fetchNextPage}
        /> */}
      </main>
    </>
  );
};

// const pluralRules = new Intl.PluralRules();
// function getPlural(number: number, singular: string, plural: string) {
//   return pluralRules.select(number) === "one" ? singular : plural;
// }

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>,
) {
  const id = context.params?.id;

  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const ssg = ssgHelper();
  await ssg.profile.getById.prefetch({ id });

  return {
    props: {
      id,
      trpcState: ssg.dehydrate(),
    },
  };
}

export default TeamPage;
