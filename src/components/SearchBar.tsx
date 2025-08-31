import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchService } from "@/services/searchService";
import { SearchResultItem } from "@/types/search";
import { Input } from "@/components/ui/input";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResultItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim()) {
      timeoutRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          // Use real search service to get suggestions
          const result = await searchService.search({
            q: query.trim(),
            pageSize: 6, // Limit suggestions to 6 items
            page: 1
          });
          setSuggestions(result.items);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Search suggestions error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // Increased debounce for real data
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
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Caută produse, branduri, categorii..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay hiding to allow clicks on suggestions
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          className="pl-10 pr-4 py-2 w-full"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-medium z-50 max-h-96 overflow-y-auto"
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
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                {product.image && product.image !== '/placeholder.svg' ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-6 h-6 text-muted-foreground ${product.image && product.image !== '/placeholder.svg' ? 'hidden' : ''}`}>
                  <Search className="w-full h-full" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{product.name}</div>
                <div className="text-success font-semibold text-sm">
                  de la {product.cheapest.price.toFixed(2)} RON
                </div>
                {product.brand && (
                  <div className="text-xs text-muted-foreground truncate">
                    {product.brand}
                  </div>
                )}
              </div>
              {product.cheapest.promoPct && (
                <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  -{product.cheapest.promoPct}%
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {showSuggestions && suggestions.length === 0 && query.trim() && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-medium z-50 p-4">
          <p className="text-muted-foreground text-sm text-center">
            Nu s-au găsit produse pentru "{query}"
          </p>
        </div>
      )}
    </div>
  );
};