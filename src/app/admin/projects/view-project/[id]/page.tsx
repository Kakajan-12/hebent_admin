"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";

import Sidebar from "@/Components/Sidebar";
import {
  buildApiUrl,
  getApiErrorStatus,
  getImagePath,
  useApi,
} from "@/hooks/useApi";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
type ProjectData = {
  id: number;
  image?: unknown;
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk: string;
  text_en: string;
  text_ru: string;
  costumer_tk: string;
  costumer_en: string;
  costumer_ru: string;
  website: string;
  gallery?: unknown[];
  details?: ProjectDetail[];
};

type ProjectDetail = {
  id?: number;
  title_tk: string;
  title_en: string;
  title_ru: string;
  text_tk: string;
  text_en: string;
  text_ru: string;
};

const ViewProject = () => {
  const { id } = useParams();
  const router = useRouter();
  const api = useApi();

  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get<ProjectData[] | ProjectData>(
          `/api/projects/${id}`,
        );
        const project = Array.isArray(response) ? response[0] : response;

        if (!project) {
          setError("Project not found");
          return;
        }

        setData(project);
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
      await api.delete(`/api/projects/${id}`);
      setShowModal(false);
      router.push("/admin/projects");
    } catch (err) {
      console.error("Ошибка при удалении:", err);
      setError("Ошибка при удалении");

      if (getApiErrorStatus(err) === 401) {
        router.push("/");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <ClipLoader size={80} color="#708DB8" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="mt-8 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const mainImagePath = getImagePath(data?.image ?? {});
  const mainImageSrc = mainImagePath ? buildApiUrl(mainImagePath) : "";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-10 ml-79 mr-7 min-h-screen">
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">View project</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/projects"
                className="inline-flex items-center gap-2 rounded-md border border-[#D9D9D9] px-4 py-2 text-sm transition hover:bg-gray-50"
              >
                <ArrowLeftIcon className="size-4" />
                Back
              </Link>
              <Link
                href={`/admin/projects/edit-project/${id}`}
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

          <div className="flex gap-6 rounded-md bg-white p-6 shadow">
            {mainImageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImageSrc}
                alt={data?.title_en || `project ${data?.id}`}
                className="h-fit max-w-[420px] rounded object-cover"
              />
            ) : null}

            <div className="flex-1 space-y-8">
              <Info label="Website">
                {data?.website ? (
                  <a
                    href={data?.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#708DB8] underline"
                  >
                    {data?.website}
                  </a>
                ) : (
                  "-"
                )}
              </Info>

              <LanguageBlock
                title="Turkmen"
                projectTitle={data?.title_tk ?? ""}
                text={data?.text_tk ?? ""}
                costumer={data?.costumer_tk ?? ""}
              />
              <LanguageBlock
                title="English"
                projectTitle={data?.title_en ?? ""}
                text={data?.text_en ?? ""}
                costumer={data?.costumer_en ?? ""}
              />
              <LanguageBlock
                title="Russian"
                projectTitle={data?.title_ru ?? ""}
                text={data?.text_ru ?? ""}
                costumer={data?.costumer_ru ?? ""}
              />

              {Array.isArray(data?.gallery) && data?.gallery.length > 0 ? (
                <div className="border-t border-[#D9D9D9] pt-6">
                  <div className="mb-4 text-lg font-bold">Gallery</div>
                  <div className="grid grid-cols-3 gap-4">
                    {data?.gallery.map((galleryItem, index) => {
                      const imagePath = getImagePath(galleryItem);
                      if (!imagePath) return null;

                      return (
                        <div
                          key={`${imagePath}-${index}`}
                          className="relative h-40"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={buildApiUrl(imagePath)}
                            alt={`gallery-${index + 1}`}
                            className="size-full rounded object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {Array.isArray(data?.details) && data?.details.length > 0 ? (
                <div className="border-t border-[#D9D9D9] pt-6">
                  <div className="mb-4 text-lg font-bold">Details</div>
                  <div className="space-y-6">
                    {data?.details.map((detail, index) => (
                      <div
                        key={detail.id ?? index}
                        className="rounded-lg border border-[#D9D9D9] p-4"
                      >
                        <div className="mb-4 font-semibold">
                          Detail {index + 1}
                        </div>
                        <DetailLanguageBlock
                          title="Turkmen"
                          detailTitle={detail?.title_tk}
                          text={detail?.text_tk}
                        />
                        <DetailLanguageBlock
                          title="English"
                          detailTitle={detail?.title_en}
                          text={detail?.text_en}
                        />
                        <DetailLanguageBlock
                          title="Russian"
                          detailTitle={detail?.title_ru}
                          text={detail?.text_ru}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {showModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Delete project?</h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete this project? This action cannot
                be undone.
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

const Info = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <strong>{label}:</strong>
    <div>{children}</div>
  </div>
);

const LanguageBlock = ({
  title,
  projectTitle,
  text,
  costumer,
}: {
  title: string;
  projectTitle: string;
  text: string;
  costumer: string;
}) => (
  <div className="border-t border-[#D9D9D9] pt-6">
    <div className="mb-2 text-lg font-bold">{title}</div>
    <Info label="Title">
      <div dangerouslySetInnerHTML={{ __html: projectTitle }} />
    </Info>
    <Info label="Text">
      <div dangerouslySetInnerHTML={{ __html: text }} />
    </Info>
    <Info label="Costumer">
      <div dangerouslySetInnerHTML={{ __html: costumer }} />
    </Info>
  </div>
);

const DetailLanguageBlock = ({
  title,
  detailTitle,
  text,
}: {
  title: string;
  detailTitle: string;
  text: string;
}) => (
  <div className="border-t border-[#D9D9D9] pt-4 first:border-t-0 first:pt-0">
    <div className="mb-2 font-semibold">{title}</div>
    <Info label="Title">
      <div dangerouslySetInnerHTML={{ __html: detailTitle }} />
    </Info>
    <Info label="Text">
      <div dangerouslySetInnerHTML={{ __html: text }} />
    </Info>
  </div>
);

export default ViewProject;
