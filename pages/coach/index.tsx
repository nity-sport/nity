import { useEffect, useState } from "react";
import Link from "next/link";

interface Coach {
    _id: string;
    name: string;
    profileImage?: string;
}

export default function CoachList() {
    const [coaches, setCoaches] = useState<Coach[]>([]);

    useEffect(() => {
        fetch("/api/coach")
            .then((res) => res.json())
            .then(setCoaches);
    }, []);

    return (
        <div>
            <h1>Coach List</h1>

            <p>
                <Link href="/coach/create">➕ Create new coach</Link>
            </p>

            <ul>
                {coaches.map((coach) => (
                    <li key={coach._id}>
                        <Link href={`/coach/${coach._id}`}>
                            <div>
                                {coach.profileImage && (
                                    <img src={coach.profileImage} alt={coach.name} width={80} height={80} />
                                )}
                                <p>{coach.name}</p>
                            </div>
                        </Link>

                    </li>
                ))}
            </ul>
        </div>
    );
}
