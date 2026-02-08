import { FaGithub } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="no-print bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-400 text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p><span className="text-white font-medium">Dhiman Roy — 2201059</span></p>
                <a
                    href="https://github.com/dr12029/VangaChura-Solutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
                >
                    <FaGithub size={16} />
                    View Source Code on GitHub
                </a>
                <p>&copy; {new Date().getFullYear()} All rights reserved</p>
            </div>
        </footer>
    );
}
