import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PostEditor } from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const [post, categories, authors, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true,
      },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage,
    featuredImageAlt: post.featuredImageAlt,
    status: post.status,
    authorId: post.authorId,
    reviewedById: post.reviewedById,
    isFeatured: post.isFeatured,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    canonicalUrl: post.canonicalUrl,
    sources: post.sources,
    publishedAt: post.publishedAt,
    categoryIds: post.categories.map((c) => c.id),
    tagIds: post.tags.map((t) => t.id),
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white">Edit Clinical Article</h1>
          <p className="text-xs text-slate-400 mt-1">
            Updating: &quot;{post.title}&quot;
          </p>
        </div>

        <PostEditor
          initialData={initialData}
          categories={categories}
          authors={authors}
          tags={tags}
        />
      </main>
    </div>
  );
}
