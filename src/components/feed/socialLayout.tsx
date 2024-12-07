import CreatePost from "./createPost";
import LeftSidebar from "./profilePanel";
import PostCard from "./postCard";
import RightSidebar from "./suggestionPanel";
import Stories from "./stories";

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const post = {
    user: {
      name: "Frances Guerrero",
      title: "Web Developer at Webestica",
      image: "https://placehold.co/100x100",
    },
    time: "2 hours ago",
    content:
      "I'm thrilled to share that I've completed a graduate certificate course in project management with the president's honor roll.",
    postImage: "https://placehold.co/600x300",
  };

  return (
    <div className="container mx-auto grid max-w-screen-xl grid-cols-12 gap-6 py-8">
      <LeftSidebar />
      <div className="col-span-6 space-y-6">
        {/* <Stories /> */}
        <CreatePost />
        <PostCard {...post} />
        {children}
      </div>
      <RightSidebar />
    </div>
  );
}
