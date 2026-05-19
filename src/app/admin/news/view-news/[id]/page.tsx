"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  buildApiUrl,
  getApiErrorStatus,
  getImagePath,
  useApi,
} from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";
interface Data {
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk?: string;
  text_en?: string;
  text_ru?: string;
  image?: unknown;
  gallery?: unknown[];
  category_tk?: string;
  category_en?: string;
  category_ru?: string;
}

const ViewNews = () => {
  const params = useParams();
  const idParam = params.id;
  const id =
    typeof idParam === "string"
      ? idParam
      : Array.isArray(idParam)
        ? idParam[0]
        : "";
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const api = useApi();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get<Data[] | Data>(`/api/news/${id}`);
        const news = Array.isArray(response) ? response[0] : response;

        if (!news) {
          setError("News not found");
          return;
        }

        setData(news);
      } catch (err) {
        console.error(err);
        setError("Ошибка при получении данных");

        if (getApiErrorStatus(err) === 401) {
          router.push("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, id, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/news/${id}`);
      setShowModal(false);
      router.push("/admin/news");
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader size={80} color="#708DB8" />
      </div>
    );
  }

  const imagePath = data ? getImagePath(data.image) : "";
  const imageSrc = imagePath ? buildApiUrl(imagePath) : "";

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">View news</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/news"
              className="inline-flex items-center gap-2 rounded-md border border-[#D9D9D9] px-4 py-2 text-sm transition hover:bg-gray-50"
            >
              <ArrowLeftIcon className="size-4" />
              Back
            </Link>
            <Link
              href={`/admin/news/edit-news/${id}`}
              className="inline-flex items-center gap-2 rounded-md border border-[#708DB8] px-4 py-2 text-sm text-[#708DB8] transition hover:bg-[#F7F9FC]"
            >
              <PencilIcon className="size-4" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
            >
              <TrashIcon className="size-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-6 rounded-xl border border-[#D9D9D9] bg-white p-6 shadow-sm">
          {imageSrc ? (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">Image</p>
              <Image
                src={imageSrc}
                alt="news"
                width={500}
                height={400}
                className="max-h-80 max-w-full rounded-lg object-contain"
                unoptimized
              />
            </div>
          ) : null}

          {data && data.gallery && data.gallery.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">Gallery</p>
              <div className="flex flex-wrap gap-2">
                {data.gallery.map((g, i) => {
                  const imagePath = getImagePath(g);
                  const gSrc = imagePath ? buildApiUrl(imagePath) : "";
                  if (!gSrc) return null;
                  return (
                    <Image
                      key={i}
                      src={gSrc}
                      alt=""
                      width={120}
                      height={120}
                      className="h-24 w-24 rounded-lg object-cover"
                      unoptimized
                    />
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="border-t border-[#D9D9D9] pt-4">
            <p className="mb-2 text-sm font-medium text-gray-600">Category</p>
            <div className="space-y-1 text-sm">
              {data && data.category_tk ? <p>{data.category_tk}</p> : null}
              {data &&
              data.category_en &&
              data.category_en !== data.category_tk ? (
                <p>{data.category_en}</p>
              ) : null}
              {data &&
              data.category_ru &&
              data.category_ru !== data.category_tk &&
              data.category_ru !== data.category_en ? (
                <p>{data.category_ru}</p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-[#D9D9D9] pt-4">
            <h3 className="mb-3 font-semibold">Turkmen</h3>
            {data && data.title_tk ? (
              <>
                <p className="mb-1 text-xs text-gray-500">Title</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: data?.title_tk || "" }}
                />
              </>
            ) : null}
            {data && data.text_tk ? (
              <>
                <p className="mb-1 mt-3 text-xs text-gray-500">Text</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: data?.text_tk || "" }}
                />
              </>
            ) : null}
          </div>

          <div className="border-t border-[#D9D9D9] pt-4">
            <h3 className="mb-3 font-semibold">English</h3>
            {data && data.title_en ? (
              <>
                <p className="mb-1 text-xs text-gray-500">Title</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: data?.title_en || "" }}
                />
              </>
            ) : null}
            {data && data.text_en ? (
              <>
                <p className="mb-1 mt-3 text-xs text-gray-500">Text</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: data?.text_en || "" }}
                />
              </>
            ) : null}
          </div>

          <div className="border-t border-[#D9D9D9] pt-4">
            <h3 className="mb-3 font-semibold">Russian</h3>
            {data && data.title_ru ? (
              <>
                <p className="mb-1 text-xs text-gray-500">Title</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: data?.title_ru || "" }}
                />
              </>
            ) : null}
            {data && data.text_ru ? (
              <>
                <p className="mb-1 mt-3 text-xs text-gray-500">Text</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: data?.text_ru || "" }}
                />
              </>
            ) : null}
          </div>
        </div>

        {showModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Delete news?</h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete this news? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 disabled:opacity-50"
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ClipLoader size={80} color="#708DB8" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ViewNews;
