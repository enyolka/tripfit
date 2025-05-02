import { useState } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FilterControlsProps {
    onFilterChange: (searchQuery: string, sortBy: 'date' | 'status' | 'name') => void;
}

export function FilterControls({ onFilterChange }: FilterControlsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        onFilterChange(value, sortBy);
    };

    const handleSortChange = (value: 'date' | 'status' | 'name') => {
        setSortBy(value);
        onFilterChange(searchQuery, value);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
                <Input
                    type="text"
                    placeholder="Search journeys..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="max-w-sm"
                    aria-label="Search journeys"
                />
            </div>
            <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}