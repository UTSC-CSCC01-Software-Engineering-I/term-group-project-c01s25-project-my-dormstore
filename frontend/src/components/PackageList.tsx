import { Package } from '../types/Package';
import { ProductCard } from './ProductCard'; 
import './ProductComponents.css';

interface PackageListProps {
  packages: Package[];
  onAddToCart: (packageId: number) => void;
  category?: string;
  linkPrefix?: string;
}

export const PackageList = ({
    packages,
    onAddToCart,
    category,
    linkPrefix = "/packages",
    }: PackageListProps) => {
        console.log("packages received:", packages);
    if (packages.length === 0) {
        return (
            <div className="empty-state">
                <p>No packages available at the moment.</p>
            </div>
        );
    }

    const categoryTextMap = {
        'Bedding': {
          title: 'Bedding That Makes Your Dorm Feel Like Home',
          description: 'Check off your list with cozy, college-ready bedding—pre-approved and bundled just for your dorm.'
        },
        'Living': {
          title: 'Make Your Dorm Feel Like Home',
          description: 'From towels to storage solutions, get the everyday essentials you need to live comfortably and stay organized in your new space.'
        },
        'Caring': {
          title: 'Send Love & Support with a Custom Care Package',
          description: 'Curated with care to bring comfort, essentials, and a little home to your student’s door.'
        },
        'Default': {
          title: 'Arrive Move-in Ready',
          description: 'As university students, no one understands the stress and challenges involved with moving into a dorm or an apartment better than we do.'
        }
    };

    const getCategoryText = (category: string) => {
            return categoryTextMap[category as keyof typeof categoryTextMap] || categoryTextMap['Default'];
    };

    const text = getCategoryText(category || 'Default');


  return (
    <div className="product-list">
      <div className="hero-section">
        <div className="hero-text">
            <h2>{text.title}</h2>
            <p>{text.description}</p>
            <a href="#package-grid" className="down-arrow" aria-label="Scroll to packages">
                <img src="/images/group-arrow.png" alt="Scroll down" />
            </a>
        </div>
        <div className="hero-image">
          <img src="/images/sleep-product.png" alt="Dorm Package" />
        </div>
      </div>

      <div id="package-grid" className="product-grid">
        {packages.map((pkg) => (
          <ProductCard
            key={pkg.id}
            product={pkg}
            onAddToCart={onAddToCart}
            linkPrefix={linkPrefix}
          />
        ))}
      </div>
    </div>
  );
};