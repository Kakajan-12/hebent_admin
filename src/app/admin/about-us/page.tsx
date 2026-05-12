import Sidebar from "@/Components/Sidebar";
import Link from "next/link";
import React from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
// import Image from "next/image";
import { EyeIcon } from "@heroicons/react/24/outline";

const AboutUsPage = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-10 ml-72">
        <div className="mt-8">
          <div className="w-full flex justify-between">
            <h2 className="text-2xl font-bold mb-4">About Us</h2>
            <Link
              href="/admin/news/add-news"
              className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center"
            >
              <PlusCircleIcon className="size-6" color="#ffffff" />
              <div className="ml-2">Add</div>
            </Link>
          </div>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                  Image
                </th>
                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                  Turkmen
                </th>
                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                  English
                </th>
                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                  Russian
                </th>
                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">
                  View
                </th>
              </tr>
            </thead>
            <tbody>
              {/* {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((data) => (
                  <tr key={data.id}>
                    <td className="py-4 px-4 border-b border-gray-200">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image}`.replace(
                          /\\/g,
                          "/",
                        )}
                        alt={`news ${data.id}`}
                        width={100}
                        height={100}
                      />
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200">
                      <div
                        dangerouslySetInnerHTML={{ __html: data.title_tk }}
                      />
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200">
                      <div
                        dangerouslySetInnerHTML={{ __html: data.title_en }}
                      />
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200">
                      <div
                        dangerouslySetInnerHTML={{ __html: data.title_ru }}
                      />
                    </td>
                    <td className="py-4 px-4 border-b border-gray-200">
                      <Link
                        href={`/admin/news/view-news/${data.id}`}
                        className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32"
                      >
                        <EyeIcon color="#ffffff" />
                        <div className="ml-2">View</div>
                      </Link>
                    </td>
                  </tr>
                ))
              )} */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
