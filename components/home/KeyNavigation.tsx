'use client';

import { useHomePageContent } from '@/components/home/HomePageContentProvider';

export default function KeyNavigation() {
    const home = useHomePageContent();
    const items = home.key_navigation?.length ? home.key_navigation : [];

    return (
        <section className="key-nav-section">
            <div className="container mx-auto px-4">
                <ul className="key-nav">
                    {items.map((item, index) => (
                        <li key={`${item.href}-${index}`} className={item.nav_class || 'nav-link1'}>
                            <figure>
                                <span>
                                    <img src={item.icon} alt={item.alt} />
                                </span>
                            </figure>
                            <a
                                href={item.href}
                                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            >
                                {item.label.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {i > 0 && <br />}
                                        {line}
                                    </span>
                                ))}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <style jsx>{`
                .key-nav-section {
                    background: #fff;
                    width: 100%;
                    float: left;
                    position: relative;
                    z-index: 10;
                }
            `}</style>
        </section>
    );
}
