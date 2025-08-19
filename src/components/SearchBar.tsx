import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchProducts, mockProducts } from "@/lib/mockData";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<typeof mockProducts>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim()) {
      timeoutRef.current = setTimeout(() => {
        const results = searchProducts(query).slice(0, 6);
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          navigate(`/product/${suggestions[selectedIndex].id}`);
          setShowSuggestions(false);
          inputRef.current?.blur();
        } else if (query.trim()) {
          navigate(`/search?q=${encodeURIComponent(query.trim())}`);
          setShowSuggestions(false);
          inputRef.current?.blur();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
    setQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          role="combobox"
        />
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-medium z-50"
          role="listbox"
        >
          {suggestions.map((product, index) => (
            <button
              key={product.id}
              onClick={() => handleSuggestionClick(product.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
                index === selectedIndex ? "bg-muted" : ""
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{product.name}</div>
                <div className="text-success font-semibold text-sm">
                  from {product.lowestPrice.toFixed(2)} RON
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {showSuggestions && suggestions.length === 0 && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-medium z-50 p-4">
          <p className="text-muted-foreground text-sm text-center">
            No products found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};