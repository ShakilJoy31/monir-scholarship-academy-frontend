"use client";

import { useState } from "react";

interface SmsSetting {
    id: number;
    title: string;
    placeholder: string;
    enabled: boolean;
    phone?: string;
}

const initialSettings: SmsSetting[] = [
    {
        id: 1,
        title: "Student's Present SMS",
        placeholder:
            "Dear Student :Name Present at :Time (:Status minutes), Date : :Date Institute. Edteco School & College.",
        enabled: true,
    },
    {
        id: 2,
        title: "Student's Absent SMS",
        placeholder:
            "Dear Parent, Your Child :Name is Absent Date : :Date Institute. Edteco School & College.",
        enabled: false,
    },
    {
        id: 3,
        title: "Student's Check Out SMS",
        placeholder:
            "Dear Parent, Your Child (:Name) Reached Our School at :Time (Early: :Early minutes), Date : :Date EDTECO School.",
        enabled: false,
    },
    {
        id: 4,
        title: "Student Leave SMS",
        placeholder: "Dear Parent, Your Child :Name, student of Class :Cl",
        enabled: false,
        phone: "01771501865",
    },
    {
        id: 5,
        title: "Teacher Leave SMS",
        placeholder: "Dear Teacher, :Name you are applied for leave for :D",
        enabled: false,
        phone: "01771501865",
    },
];

const AutoSmsSetting = () => {
    const [settings, setSettings] = useState(initialSettings);

    const toggleSetting = (id: number) => {

        setSettings((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, enabled: !s.enabled } : s
            )
        );
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">SMS Settings</h2>
            <div className="space-y-4">
                {settings.map((s) => (
                    <div
                        key={s.id}
                        className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg shadow bg-white"
                    >
                        {/* Title & Toggle */}
                        <div className="flex items-center gap-3 w-full md:w-2/6 2xl:w-1/4">
                            <span
                                className={`font-semibold w-[calc(100%_-_70px)] text-sm px-3 py-1 rounded text-white ${s.id === 1
                                    ? "bg-purple-600"
                                    : s.id === 2
                                        ? "bg-green-600"
                                        : s.id === 3
                                            ? "bg-blue-600"
                                            : s.id === 4
                                                ? "bg-purple-700"
                                                : "bg-teal-600"
                                    }`}
                            >
                                {s.title}
                            </span>
                            <button
                                onClick={() => toggleSetting(s.id)}
                                className={`w-[48px] h-6 rounded-full relative transition ${s.enabled ? "bg-blue-500" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition ${s.enabled ? "translate-x-6" : ""
                                        }`}
                                />
                            </button>
                            {/* <Switch
                                // checked={checked}
                                onChange={() => ""}
                                slotProps={{ input: { 'aria-label': 'controlled' } }}
                            /> */}
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            defaultValue={s.placeholder}
                        />

                        {/* Phone (optional) */}
                        {s.phone && (
                            <input
                                type="text"
                                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                defaultValue={s.phone}
                            />
                        )}

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Update
                            </button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                Save
                            </button>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AutoSmsSetting;