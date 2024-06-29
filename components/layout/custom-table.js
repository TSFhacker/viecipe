"use client";

import { timeAgo } from "@/lib/helper";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import defaultImage from "@/assets/default_profile.svg";
import classes from "./custom-table.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { MdBlock } from "react-icons/md";
import { CgUnblock } from "react-icons/cg";
import { FaTrash } from "react-icons/fa"; // Import the FaTrash icon
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/app/meals/loading";

export default function CustomTable({ data }) {
  const [columnResizeMode, setColumnResizeMode] = useState("onChange");
  const [tableData, setTableData] = useState(data);

  const [columnResizeDirection, setColumnResizeDirection] = useState("ltr");
  const columnHelper = createColumnHelper();
  let columns = [];

  const blockUser = async function (userId) {
    try {
      const response = await fetch("/api/admin/user_status", {
        method: "POST",
        body: JSON.stringify({ userId, currentStatus: "active" }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (response.ok) {
        // Update the user's status in tableData
        setTableData((prevData) =>
          prevData.map((user) =>
            user._id === userId ? { ...user, status: "blocked" } : user
          )
        );
        toast(result.message);
      } else {
        toast(result.message);
      }
    } catch (error) {
      toast(error.message);
    }
  };

  const unblockUser = async function (userId) {
    try {
      const response = await fetch("/api/admin/user_status", {
        method: "POST",
        body: JSON.stringify({ userId, currentStatus: "blocked" }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        // Update the user's status in tableData
        setTableData((prevData) =>
          prevData.map((user) =>
            user._id === userId ? { ...user, status: "active" } : user
          )
        );
        toast(result.message);
      } else {
        toast(result.message);
      }
    } catch (error) {
      toast(error.message);
    }
  };

  const deleteRecipe = async function (recipeId) {
    try {
      const response = await fetch("/api/recipe", {
        method: "DELETE",
        body: JSON.stringify({ recipeId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        // Remove the recipe from tableData
        setTableData((prevData) =>
          prevData.filter((recipe) => recipe._id !== recipeId)
        );
        toast(result.message);
      } else {
        toast(result.message);
      }
    } catch (error) {
      toast(error.message);
    }
  };

  const pathName = usePathname();
  if (pathName === "/admin/recipes") {
    columns = [
      columnHelper.accessor("image", {
        header: () => "Ảnh",
        cell: (info) => (
          <Image
            src={`https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${info.getValue()}`}
            alt="Ảnh công thức"
            width={250}
            height={150}
          />
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("recipe_name", {
        header: () => "Tên công thức",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("user_info", {
        header: () => "Tên người dùng",
        cell: (info) => info.getValue()[0].name || info.getValue()[0].email,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("ratingAvg", {
        header: () => "Đánh giá",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("created_at", {
        header: () => "Thời gian đăng",
        cell: (info) => timeAgo(new Date(info.getValue())),
        footer: (info) => info.column.id,
      }),

      columnHelper.accessor("_id", {
        header: () => "Url",
        cell: (info) => (
          <Link href={`/meals/${info.getValue()}`}>Chi tiết</Link>
        ),
        footer: (info) => info.column.id,
      }),

      columnHelper.accessor((row) => row, {
        id: "delete",
        header: () => "Hành động",
        cell: (info) => (
          <FaTrash
            onClick={() => deleteRecipe(info.getValue()._id)}
            className={`${classes.icon} ${classes.trash}`}
          />
        ),
      }),
    ];
  } else {
    columns = [
      columnHelper.accessor("image", {
        header: () => "Ảnh",
        cell: (info) => (
          <Image
            src={
              info.getValue()
                ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${info.getValue()}`
                : defaultImage
            }
            alt="Ảnh"
            width={250}
            height={150}
          />
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("name", {
        header: () => "Tên người dùng",
        cell: (info) => info.getValue() || "",
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("email", {
        header: () => "Email",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("followers", {
        header: () => "Người theo dõi",
        cell: (info) => info.getValue().length,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("following", {
        header: () => "Đang theo dõi",
        cell: (info) => info.getValue().length,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("recipeCount", {
        header: () => "Số bài đăng",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("_id", {
        header: () => "Trang cá nhân",
        cell: (info) => (
          <Link href={`/profile/${info.getValue()}`}>Trang cá nhân</Link>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row, {
        id: "block",
        header: () => "Hành động",
        cell: (info) => {
          return info.getValue().status === "blocked" ? (
            <CgUnblock
              className={`${classes.icon} ${classes.unblock}`}
              onClick={() => unblockUser(info.getValue()._id)}
            />
          ) : (
            <MdBlock
              className={`${classes.icon} ${classes.block}`}
              onClick={() => blockUser(info.getValue()._id)}
            />
          );
        },
      }),
    ];
  }

  const table = useReactTable({
    columns,
    data: tableData,
    columnResizeMode,
    columnResizeDirection,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  return (
    <>
      <ToastContainer />
      <table className={classes.custom_table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
