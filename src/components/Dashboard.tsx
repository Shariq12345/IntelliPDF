"use client";

import React, { useState } from "react";
import UploadButton from "./UploadButton";
import { trpc } from "@/app/_trpc/client";
import { Calendar, Ghost, Loader, MessageCircle, Trash2 } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";

const Dashboard = () => {
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: files, isLoading } = trpc.getFiles.useQuery();

  // Will run the mutation -> deleteFile when used anywhere in the app
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getFiles.invalidate();
    },
    onMutate({ id }) {
      setDeletingFile(id);
    },
    onSettled() {
      setDeletingFile(null);
    },
  });

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-4xl text-gray-900">My Files</h1>

        <UploadButton />
      </div>

      {/* DISPLAY FILES OF THE CURRENT USER */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 bg-white shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="p-6 flex w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    {format(new Date(file.createdAt), "dd/MM/yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="size-4" />
                    mock
                  </div>
                  <Button
                    className="bg-rose-500 hover:bg-rose-600"
                    size="sm"
                    onClick={() => deleteFile({ id: file.id })}
                  >
                    {deletingFile === file.id ? (
                      <Loader className="size-4" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton count={4} height={100} className="my-2" />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="size-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">
            You have no PDF uploaded yet
          </h3>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
