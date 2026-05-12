"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Sidebar from "@/Components/Sidebar";
import {
  getBlogById,
  getBlogMainImageSrc,
  resolveBlogImageSrc,
  type StoredBlog,
} from "@/lib/blogsLocalStore";

function formatBlogDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

const ViewBlogPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [blog, setBlog] = useState<StoredBlog | null | undefined>(undefined);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }
    if (!Number.isFinite(id)) {
      setBlog(null);
      return;
    }
    setBlog(getBlogById(id));
  }, [router, id]);

  if (blog === undefined) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <p className="text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
          <p className="text-gray-500">Blog not found.</p>
          <Link
            href="/admin/blogs"
            className="mt-4 inline-block text-[#708DB8]"
          >
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  const main = getBlogMainImageSrc(blog);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 py-10 ml-79 mr-7 min-h-screen">
        <Link
          href="/admin/blogs"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#708DB8] hover:underline"
        >
          <ArrowLeftIcon className="size-4" />
          Blogs
        </Link>
        <div className="rounded-lg border border-black bg-white p-6">
          <p className="text-sm text-gray-500">{formatBlogDate(blog.date)}</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-2">
            <div>
              {main ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={main}
                  alt=""
                  className="w-full max-w-lg rounded-xl object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-semibold uppercase text-gray-400">
                  Turkmen
                </h3>
                <div
                  className="mt-1 [&_p]:my-0"
                  dangerouslySetInnerHTML={{ __html: blog.title_tk }}
                />
                <div
                  className="prose prose-sm mt-2 max-w-none [&_p]:my-1"
                  dangerouslySetInnerHTML={{ __html: blog.text_tk }}
                />
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase text-gray-400">
                  English
                </h3>
                <div
                  className="mt-1 [&_p]:my-0"
                  dangerouslySetInnerHTML={{ __html: blog.title_en }}
                />
                <div
                  className="prose prose-sm mt-2 max-w-none [&_p]:my-1"
                  dangerouslySetInnerHTML={{ __html: blog.text_en }}
                />
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase text-gray-400">
                  Russian
                </h3>
                <div
                  className="mt-1 [&_p]:my-0"
                  dangerouslySetInnerHTML={{ __html: blog.title_ru }}
                />
                <div
                  className="prose prose-sm mt-2 max-w-none [&_p]:my-1"
                  dangerouslySetInnerHTML={{ __html: blog.text_ru }}
                />
              </section>
            </div>
          </div>
          {blog.gallery.length > 0 ? (
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold">Gallery</h3>
              <div className="flex flex-wrap gap-3">
                {blog.gallery.map((url, i) => {
                  const src = resolveBlogImageSrc(url);
                  if (!src) return null;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${url}-${i}`}
                      src={src}
                      alt=""
                      className="h-24 w-36 rounded-lg object-cover"
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ViewBlogPage;
