import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface AiTool {
  id: string;
  name: string;
  description: string;
  category: 'image' | 'video' | 'audio' | '3d' | 'text' | 'multimodal';
  provider: string;
  icon: string;
  popularityScore: number;
  creditsPerUse: number;
  isFeatured: boolean;
  isNew: boolean;
  capabilities: string[];
  inputTypes: string[];
  outputTypes: string[];
  samples?: string[];
}

export default function ToolsPage() {
  const router = useRouter();
  const [tools, setTools] = useState<AiTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'popular' | 'newest' | 'name' | 'credits'>('popular');

  // Categories for filtering
  const categories = [
    { id: 'image', name: 'Image Generation', icon: '🖼️' },
    { id: 'video', name: 'Video Generation', icon: '🎬' },
    { id: 'audio', name: 'Audio & Music', icon: '🎵' },
    { id: '3d', name: '3D Models', icon: '🧊' },
    { id: 'text', name: 'Text & Content', icon: '📝' },
    { id: 'multimodal', name: 'Multimodal', icon: '🔄' },
  ];

  // Load AI tools
  useEffect(() => {
    // Simulating API call to fetch tools
    const fetchTools = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data
        setTimeout(() => {
          setTools(getMockTools());
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching AI tools:', error);
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Generate mock data for tools
  const getMockTools = (): AiTool[] => {
    return [
      {
        id: 'midjourney',
        name: 'Midjourney',
        description: 'Create stunning, photorealistic images from text prompts with advanced AI technology.',
        category: 'image',
        provider: 'Midjourney',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzE5MjAzRSIvPjxwYXRoIGQ9Ik0zMyA2NVYzNUw1MCAxOS41TDY3IDM1VjY1TDUwIDgwLjVMMzMgNjVaIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNSIvPjwvc3ZnPg==',
        popularityScore: 98,
        creditsPerUse: 5,
        isFeatured: true,
        isNew: false,
        capabilities: ['Photorealistic images', 'Artistic styles', 'Concept art', 'Product design', 'Architectural visualization'],
        inputTypes: ['Text prompt', 'Reference images'],
        outputTypes: ['PNG', 'JPG'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzQjgyRjYiLz48cGF0aCBkPSJNMCAwaDE0OHY5NEgwVjB6IiBmaWxsPSIjRkVEN0FBIi8+PHBhdGggZD0iTTAgOTRoMjAwdjEwNkgwVjk0eiIgZmlsbD0iIzQyOEJGNSIvPjxwYXRoIGQ9Ik0xMTAgNjBMMTgwIDk0TDExMCAxNDBWNjB6IiBmaWxsPSIjRjk3RjUxIi8+PC9zdmc+',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0MjhCRjUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjUwIiBmaWxsPSIjRkZGRkZGIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjxyZWN0IHg9IjcwIiB5PSI3MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjk3RjUxIi8+PC9zdmc+',
        ],
      },
      {
        id: 'stable-diffusion',
        name: 'Stable Diffusion',
        description: 'Open-source text-to-image model capable of generating detailed images from natural language descriptions.',
        category: 'image',
        provider: 'Stability AI',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzY5MkU3MSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjI1IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iNCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjE1IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUiIGZpbGw9IiNGRkYiLz48L3N2Zz4=',
        popularityScore: 92,
        creditsPerUse: 3,
        isFeatured: true,
        isNew: false,
        capabilities: ['Photo generation', 'Art generation', 'Outpainting', 'Image-to-image transformation'],
        inputTypes: ['Text prompt', 'Image input', 'Mask input'],
        outputTypes: ['PNG', 'JPG', 'WEBP'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGOTdGNTEiLz48cGF0aCBkPSJNMCAwaDIwMHYyMDBIMFYweiIgZmlsbD0iI0ZFRDdBQSIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBkPSJNNzAgMTMwQzcwIDEwMS43MTcgOTEuNzE3IDgwIDEyMCA4MEMxNDguMjgzIDgwIDE3MCAxMDEuNzE3IDE3MCAxMzBWMTUwQzE3MCAxNzEuNzE3IDE1MS43MTcgMTkwIDEzMCAxOTBINDBDMTguMjgzIDE5MCAwIDE3MS43MTcgMCAxNTBWMTQwQzAgMTM0LjQ3NyA0LjQ3NzIgMTMwIDEwIDEzMEg3MFoiIGZpbGw9IiM2OTJFNzEiLz48L3N2Zz4=',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM2OTJFNzEiLz48cGF0aCBkPSJNMCAwaDIwMHYxMDBIMFYweiIgZmlsbD0iIzQyOEJGNSIvPjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEg1MEwxMDAgNTB6IiBmaWxsPSIjRkZGRkZGIi8+PHBhdGggZD0iTTcwIDE0MEw1MCAxMjBMMTAwIDE1MEwxNTAgMTIwTDEzMCAxNDBMNzAgMTQweiIgZmlsbD0iI0ZFRDdBQSIvPjwvc3ZnPg==',
        ],
      },
      {
        id: 'dalle3',
        name: 'DALL-E 3',
        description: 'Advanced AI image generation model by OpenAI with superior understanding of prompts and artistic capabilities.',
        category: 'image',
        provider: 'OpenAI',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzEwQTM3RiIvPjxwYXRoIGQ9Ik01MCAyNUw3NSA3NUwyNSA3NUw1MCAyNVoiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=',
        popularityScore: 95,
        creditsPerUse: 6,
        isFeatured: true,
        isNew: false,
        capabilities: ['Photorealistic images', 'Creative interpretations', 'Detailed compositions', 'Accurate text rendering'],
        inputTypes: ['Text prompt'],
        outputTypes: ['PNG', 'JPG'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNCMkY1RUEiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI2MCIgcj0iMzAiIGZpbGw9IiMxMEEzN0YiLz48cmVjdCB4PSI0MCIgeT0iMTMwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjUwIiByeD0iMTAiIGZpbGw9IiNGRkZGRkYiLz48Y2lyY2xlIGN4PSI3MCIgY3k9IjE1NSIgcj0iMTAiIGZpbGw9IiMxMEEzN0YiLz48Y2lyY2xlIGN4PSIxMzAiIGN5PSIxNTUiIHI9IjEwIiBmaWxsPSIjMTBBMzdGIi8+PHBhdGggZD0iTTE0MCA5MEMxNDAgNzkuNSAxMjUuNSA2MCAxMDAgNjBDNzQuNSA2MCA2MCA3OS41IDYwIDkwQzYwIDEwMC41IDc0LjUgMTEwIDEwMCAxMTBDMTI1LjUgMTEwIDE0MCAxMDAuNSAxNDAgOTBaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0MjhCRjUiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiByeD0iMTAiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PHBhdGggZD0iTTYwIDYwQzYwIDQ5LjA2OCA2OC45NTQgNDAgODAgNDBDOTEuMDQ2IDQwIDEwMCA0OS4wNjggMTAwIDYwQzEwMCA3MC45MzIgOTEuMDQ2IDgwIDgwIDgwQzY4Ljk1NCA4MCA2MCA3MC45MzIgNjAgNjB6TTE0MCA2MEMxNDAgNDkuMDY4IDE0OC45NTQgNDAgMTYwIDQwQzE3MS4wNDYgNDAgMTgwIDQ5LjA2OCAxODAgNjBDMTgwIDcwLjkzMiAxNzEuMDQ2IDgwIDE2MCA4MEMxNDguOTU0IDgwIDE0MCA3MC45MzIgMTQwIDYwek02MCAxNDBDNjAgMTI5LjA2OCA2OC45NTQgMTIwIDgwIDEyMEM5MS4wNDYgMTIwIDEwMCAxMjkuMDY4IDEwMCAxNDBDMTAwIDE1MC45MzIgOTEuMDQ2IDE2MCA4MCAxNjBDNjguOTU0IDE2MCA2MCAxNTAuOTMyIDYwIDE0MHpNMTQwIDE0MEMxNDAgMTI5LjA2OCAxNDguOTU0IDEyMCAxNjAgMTIwQzE3MS4wNDYgMTIwIDE4MCAxMjkuMDY4IDE4MCAxNDBDMTgwIDE1MC45MzIgMTcxLjA0NiAxNjAgMTYwIDE2MEMxNDguOTU0IDE2MCAxNDAgMTUwLjkzMiAxNDAgMTQweiIgZmlsbD0iIzEwQTM3RiIvPjwvc3ZnPg==',
        ],
      },
      {
        id: 'kling-ai',
        name: 'Kling AI',
        description: 'Create professional-quality videos from text prompts in minutes, with advanced motion and animation technology.',
        category: 'video',
        provider: 'Kling',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzQ4NEJCQyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik00NSA0MEw2MCA1MEw0NSA2MFY0MFoiIGZpbGw9IiM0ODRCQkMiLz48L3N2Zz4=',
        popularityScore: 87,
        creditsPerUse: 8,
        isFeatured: true,
        isNew: true,
        capabilities: ['Short video generation', 'Character animation', 'Text-to-video creation', 'Scene transitions'],
        inputTypes: ['Text prompt', 'Image input', 'Audio input'],
        outputTypes: ['MP4', 'MOV', 'GIF'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ODRCQkMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjUwIiBmaWxsPSIjRDNEM0ZFIi8+PHBhdGggZD0iTTkwIDgwTDEyMCAxMDBMOTAgMTIwVjgwWiIgZmlsbD0iIzQ4NEJCQyIvPjwvc3ZnPg==',
        ],
      },
      {
        id: 'gen2',
        name: 'Gen-2',
        description: 'Easily create videos from text, images, or video clips with AI-powered video generation and editing.',
        category: 'video',
        provider: 'Runway',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iI0ZGM0I1QiIvPjxwYXRoIGQ9Ik0zMCA3MEw3MCAzMEw3MCA3MEwzMCA3MHoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
        popularityScore: 85,
        creditsPerUse: 10,
        isFeatured: false,
        isNew: false,
        capabilities: ['Video generation', 'Video editing', 'Style transfer', 'Motion brushes'],
        inputTypes: ['Text prompt', 'Image input', 'Video input'],
        outputTypes: ['MP4', 'MOV'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRjNCNUIiLz48cGF0aCBkPSJNNTAgNTBMMTUwIDUwTDE1MCAxNTBMNTAgMTUwTDUwIDUweiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PHBhdGggZD0iTTkwIDgwTDEyMCAxMDBMOTAgMTIwVjgwWiIgZmlsbD0iI0ZGRkZGRiIvPjwvc3ZnPg==',
        ],
      },
      {
        id: 'mmaudio',
        name: 'MMAudio',
        description: 'Generate realistic music, sound effects, and audio compositions with AI-powered audio synthesis technology.',
        category: 'audio',
        provider: 'MMAudio Inc.',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzJBOUM2OCIvPjxwYXRoIGQ9Ik0zMCA1MEg0MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNDUgMzVINTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQ1IDUwSDU1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik00NSA2NUg1NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNjAgNTBINzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
        popularityScore: 84,
        creditsPerUse: 4,
        isFeatured: false,
        isNew: false,
        capabilities: ['Music generation', 'Sound effects', 'Voice synthesis', 'Audio enhancement'],
        inputTypes: ['Text prompt', 'Audio input', 'MIDI input'],
        outputTypes: ['MP3', 'WAV', 'AIFF'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyQTlDNjgiLz48cGF0aCBkPSJNNDAgODBINjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTcwIDYwSDkwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMDAgOTBIMTIwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMzAgNzBIMTUwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xNjAgMTEwSDE4MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
        ],
      },
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        description: 'AI voice technology that creates realistic, expressive voices for any character or content.',
        category: 'audio',
        provider: 'ElevenLabs',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzE5MUUyOSIvPjxwYXRoIGQ9Ik0zNSA1MEg0NSIgc3Ryb2tlPSIjNTg2N0RCIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik00NSAzNUg1NSIgc3Ryb2tlPSIjNTg2N0RCIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik00NSA1MEg1NSIgc3Ryb2tlPSIjNTg2N0RCIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik00NSA2NUg1NSIgc3Ryb2tlPSIjNTg2N0RCIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik01NSA1MEg2NSIgc3Ryb2tlPSIjNTg2N0RCIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
        popularityScore: 88,
        creditsPerUse: 5,
        isFeatured: false,
        isNew: true,
        capabilities: ['Voice synthesis', 'Voice cloning', 'Multi-language support', 'Voice customization'],
        inputTypes: ['Text input', 'Voice sample'],
        outputTypes: ['MP3', 'WAV'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxOTFFMjkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjUwIiBzdHJva2U9IiM1ODY3REIiIHN0cm9rZS13aWR0aD0iOCIvPjxwYXRoIGQ9Ik04MCA4MEwxMjAgMTIwIiBzdHJva2U9IiM1ODY3REIiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTEyMCA4MEw4MCAxMjAiIHN0cm9rZT0iIzU4NjdEQiIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
        ],
      },
      {
        id: 'shape-e',
        name: 'Shape-E',
        description: 'Generate 3D models from text descriptions or 2D images with AI-powered 3D synthesis technology.',
        category: '3d',
        provider: 'OpenAI',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iI0ZGOTUwMCIvPjxwYXRoIGQ9Ik0zMCA1MEw1MCAzMEw3MCA1MEw1MCA3MEwzMCA1MFoiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik01MCAzMFY3MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTMwIDUwSDcwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=',
        popularityScore: 79,
        creditsPerUse: 7,
        isFeatured: false,
        isNew: true,
        capabilities: ['3D model generation', '2D-to-3D conversion', 'Text-to-3D generation'],
        inputTypes: ['Text prompt', 'Image input'],
        outputTypes: ['GLB', 'OBJ', 'USDZ'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRjk1MDAiLz48cGF0aCBkPSJNNjAgMTAwTDEwMCA2MEwxNDAgMTAwTDEwMCAxNDBMNjAgMTAwWiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI4Ii8+PHBhdGggZD0iTTEwMCA2MFYxNDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik02MCAxMDBIMTQwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMTQwIDYwTDYwIDE0MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0Ii8+PC9zdmc+',
        ],
      },
      {
        id: 'claude',
        name: 'Claude AI',
        description: 'Advanced language model for text generation, summarization, and content creation with exceptional writing quality.',
        category: 'text',
        provider: 'Anthropic',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzQyODVGNCIvPjxwYXRoIGQ9Ik0zMCAzMEg3MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzAgNTBINzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTMwIDcwSDUwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
        popularityScore: 90,
        creditsPerUse: 2,
        isFeatured: false,
        isNew: false,
        capabilities: ['Text generation', 'Summarization', 'Content writing', 'Translation', 'Code generation'],
        inputTypes: ['Text prompt'],
        outputTypes: ['Text', 'HTML', 'Markdown'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0Mjg1RjQiLz48cGF0aCBkPSJNNDAgNDBIMTYwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MCA3MEgxNjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQwIDEwMEgxNjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQwIDEzMEgxMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQwIDE2MEg4MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
        ],
      },
      {
        id: 'gemini',
        name: 'Gemini Pro',
        description: 'Multimodal AI model that can understand and generate text, images, audio, and code with seamless integration.',
        category: 'multimodal',
        provider: 'Google',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iIzQyNTVGNiIvPjxjaXJjbGUgY3g9IjMzIiBjeT0iNTAiIHI9IjE1IiBmaWxsPSIjRkY5MzFGIi8+PGNpcmNsZSBjeD0iNjciIGN5PSI1MCIgcj0iMTUiIGZpbGw9IiMwRjlENTgiLz48cGF0aCBkPSJNNDUgMjhMNTUgNzIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIvPjwvc3ZnPg==',
        popularityScore: 93,
        creditsPerUse: 3,
        isFeatured: false,
        isNew: true,
        capabilities: ['Text generation', 'Image understanding', 'Code generation', 'Cross-modal reasoning'],
        inputTypes: ['Text prompt', 'Image input', 'Audio input'],
        outputTypes: ['Text', 'Code', 'HTML'],
        samples: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0MjU1RjYiLz48Y2lyY2xlIGN4PSI2NCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNGRjkzMUYiLz48Y2lyY2xlIGN4PSIxMzYiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjMEY5RDU4Ii8+PHBhdGggZD0iTTEwMCA1MEwxMDAgMTUwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjgiLz48L3N2Zz4=',
        ],
      }
    ];
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'image':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'video':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'audio':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case '3d':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'text':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'multimodal':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Filter tools based on search query and category
  const filteredTools = tools.filter(tool => {
    const matchesSearch = !searchQuery || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort tools
  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortOption === 'popular') {
      return b.popularityScore - a.popularityScore;
    } else if (sortOption === 'newest') {
      return a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1;
    } else if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'credits') {
      return a.creditsPerUse - b.creditsPerUse;
    }
    return 0;
  });

  // Group featured tools
  const featuredTools = sortedTools.filter(tool => tool.isFeatured);
  const regularTools = sortedTools.filter(tool => !tool.isFeatured);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            AI Tools
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Explore and use over 100 AI tools to create, transform, and enhance your content
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for AI tools..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="w-full md:w-44">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="block w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="credits">Lowest Credits</option>
              </select>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 text-sm rounded-full border ${
                !selectedCategory
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All Categories
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedCategory === category.id
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="mr-1">{category.icon}</span> {category.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="loading loading-lg"></div>
          </div>
        ) : sortedTools.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No AI Tools Found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We couldn't find any AI tools matching your search criteria. Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Tools Section */}
            {featuredTools.length > 0 && !searchQuery && !selectedCategory && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Featured Tools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/dashboard/tools/${tool.id}`}
                      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        {tool.samples && tool.samples.length > 0 ? (
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={tool.samples[0]}
                              alt={`${tool.name} sample`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-slate-100 dark:bg-slate-700"></div>
                        )}
                        
                        {/* Tool icon (absolute positioned over the sample) */}
                        <div className="absolute bottom-0 left-0 transform translate-x-4 translate-y-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                            <img
                              src={tool.icon}
                              alt={tool.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        {/* New badge */}
                        {tool.isNew && (
                          <div className="absolute top-2 right-2">
                            <span className="badge badge-primary">New</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 pt-8">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {tool.name}
                          </h3>
                          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            {tool.creditsPerUse} credits
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                          {tool.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(tool.category)}`}>
                            {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
                          </span>
                          
                          <div className="flex items-center text-slate-400 dark:text-slate-500">
                            <svg className="w-4 h-4 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {tool.popularityScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Tools Section */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                {searchQuery || selectedCategory ? 'Search Results' : 'All AI Tools'}
                <span className="text-slate-500 dark:text-slate-400 text-sm font-normal ml-2">
                  ({regularTools.length} {regularTools.length === 1 ? 'tool' : 'tools'})
                </span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {regularTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/dashboard/tools/${tool.id}`}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-start mb-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                          <img
                            src={tool.icon}
                            alt={tool.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                            {tool.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            by {tool.provider}
                          </p>
                        </div>
                        
                        {tool.isNew && (
                          <span className="ml-auto badge badge-sm badge-primary">New</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-grow line-clamp-3">
                        {tool.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(tool.category)}`}>
                          {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
                        </span>
                        
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {tool.creditsPerUse} credits
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
