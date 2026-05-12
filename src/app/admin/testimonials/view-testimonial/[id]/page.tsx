"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/Components/Sidebar";
import { getApiErrorStatus, useApi } from "@/hooks/useApi";
import { ClipLoader } from "react-spinners";

type TestimonialItem = {
  id: number;
  company: string;
  text: string;
  name: string;
  job_title: string;
};

const ViewTestimonialPage = () => {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const id = Number(params.id);
  const [row, setRow] = useState<TestimonialItem | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cleanText = (text: string) => text.replace(/<\/?[^>]+(>|$)/g, "");

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setRow(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get<TestimonialItem[] | TestimonialItem>(
          `/api/testimonials/${id}`,
        );
        const data = Array.isArray(response) ? response[0] : response;
        setRow(data ?? null);
      } catch (err) {
        console.error(err);
        if (getApiErrorStatus(err) === 401) {
          router.push("/");
          return;
        }
        setError("Testimonial not found");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, id, router]);

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
          <div className="mt-8 rounded-xl border border-[#D9D9D9] bg-white p-6 shadow-sm">
            <p className="text-gray-600">Testimonial not found.</p>
            <Link
              href="/admin/testimonials"
              className="mt-4 inline-block text-[#708DB8] underline"
            >
              Back to list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-79 mr-7 py-10">
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Testimonial {cleanText(row?.name ?? "")}
          </h2>
          <button
            type="button"
            onClick={() => router.push("/admin/testimonials")}
            className="rounded-md border border-[#D9D9D9] px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <div className="mt-6 space-y-6 rounded-xl border border-[#D9D9D9] bg-white p-6 shadow-sm">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-600">Company</p>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: row?.company ?? "" }}
            />
          </div>

          <div className="border-t border-[#D9D9D9] pt-4">
            <p className="mb-1 text-sm font-medium text-gray-600">Text</p>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: row?.text ?? "" }}
            />
          </div>

          <div className="border-t border-[#D9D9D9] pt-4">
            <p className="mb-1 text-sm font-medium text-gray-600">Name</p>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: row?.name ?? "" }}
            />
          </div>

          <div className="border-t border-[#D9D9D9] pt-4">
            <p className="mb-1 text-sm font-medium text-gray-600">Job title</p>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: row?.job_title ?? "" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTestimonialPage;
