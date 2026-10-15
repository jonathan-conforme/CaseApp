import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
                            viewBox="0 0 100 100"
                            className="w-20 h-20 text-[#D4AF37] drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)]"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M50 10 L85 24 C85 58 70 82 50 92 C30 82 15 58 15 24 L50 10 Z"
                                stroke="currentColor"
                                strokeWidth="5"
                                fill="none"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M55 20 L32 52 H52 L45 80 L70 46 H50 L55 20 Z"
                                fill="currentColor"
                            />
                        </svg>
    );
}
