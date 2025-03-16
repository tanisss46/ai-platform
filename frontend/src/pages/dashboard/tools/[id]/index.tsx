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
  parameters?: ToolParameter[];
  longDescription?: string;
}

interface ToolParameter {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'slider' | 'color' | 'file';
  default?: any;
  required: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  acceptedFileTypes?: string[];
}

import { NextPageWithLayout } from '@/pages/_app';
import type { ReactElement } from 'react';

const ToolDetail: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [tool, setTool] = useState<AiTool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'generator' | 'examples' | 'about'>('generator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, any>>({});

  // Load tool details
  useEffect(() => {
    if (!id) return;

    // In a real app, you would fetch the tool from your API
    // For now, we'll use mock data
    const fetchTool = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          const mockTool = getMockTool(id as string);
          setTool(mockTool);
          
          // Initialize parameter values
          if (mockTool?.parameters) {
            const initialValues: Record<string, any> = {};
            mockTool.parameters.forEach(param => {
              initialValues[param.id] = param.default || '';
            });
            setParamValues(initialValues);
          }
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching tool details:', error);
        setIsLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  // Get mock tool data
  const getMockTool = (toolId: string): AiTool | null => {
    // These would come from your API in a real app
    const tools = {
      'midjourney': {
        id: 'midjourney',
        name: 'Midjourney',
        description: 'Create stunning, photorealistic images from text prompts with advanced AI technology.',
        longDescription: `Midjourney is a generative AI program that creates images from textual descriptions, similar to OpenAI's DALL-E and Stable Diffusion. The tool has gained significant popularity for its aesthetic flexibility and high-quality outputs that span various artistic styles from photorealistic to fantastical and surreal imagery.

The AI model is particularly known for its ability to generate detailed, artistic images with unique stylistic elements that have become recognizable as a "Midjourney style." It excels at creating architectural visualizations, concept art, product mockups, and artistic renderings.

Midjourney can understand complex prompts, including references to various artistic movements, techniques, materials, and can incorporate specific lighting conditions, perspectives, and compositional elements. The outputs are suitable for creative professionals, marketers, designers, and hobbyists looking to generate visual content quickly.`,
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
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRkNEOTkiLz48Y2lyY2xlIGN4PSI3MCIgY3k9IjMwIiByPSIyMCIgZmlsbD0iI0ZGNkI2QiIvPjxyZWN0IHg9IjIwIiB5PSI1MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQTZFNEZGIi8+PHBhdGggZD0iTTAgMEwyMCAwTDEwIDE1TDAgMFoiIGZpbGw9IiM4QjVDRjYiLz48cGF0aCBkPSJNNTAgNzBMODAgOTBMMzAgOTVMNTAgNzBaIiBmaWxsPSIjOEI1Q0Y2Ii8+PC9zdmc+',
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM2OTJFNzEiLz48cGF0aCBkPSJNMCAwaDIwMHYxMDBIMFYweiIgZmlsbD0iIzQyOEJGNSIvPjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEg1MEwxMDAgNTB6IiBmaWxsPSIjRkZGRkZGIi8+PHBhdGggZD0iTTcwIDE0MEw1MCAxMjBMMTAwIDE1MEwxNTAgMTIwTDEzMCAxNDBMNzAgMTQweiIgZmlsbD0iI0ZFRDdBQSIvPjwvc3ZnPg==',
        ],
        parameters: [
          {
            id: 'prompt',
            name: 'Prompt',
            description: 'Describe the image you want to generate',
            type: 'text',
            required: true,
            placeholder: 'A photorealistic portrait of a cyberpunk astronaut with neon lights, 8k, detailed...'
          },
          {
            id: 'style',
            name: 'Style',
            description: 'Select the artistic style for your image',
            type: 'select',
            default: 'photorealistic',
            required: false,
            options: [
              { value: 'photorealistic', label: 'Photorealistic' },
              { value: 'artistic', label: 'Artistic' },
              { value: 'cinematic', label: 'Cinematic' },
              { value: 'anime', label: 'Anime' },
              { value: 'fantasy', label: 'Fantasy' },
              { value: 'abstract', label: 'Abstract' }
            ]
          },
          {
            id: 'ratio',
            name: 'Aspect Ratio',
            description: 'Select the aspect ratio for your image',
            type: 'select',
            default: '1:1',
            required: false,
            options: [
              { value: '1:1', label: 'Square (1:1)' },
              { value: '16:9', label: 'Landscape (16:9)' },
              { value: '9:16', label: 'Portrait (9:16)' },
              { value: '4:3', label: 'Standard (4:3)' },
              { value: '3:2', label: 'Classic (3:2)' }
            ]
          },
          {
            id: 'quality',
            name: 'Quality',
            description: 'Set the quality level of the generated image',
            type: 'slider',
            default: 85,
            min: 25,
            max: 100,
            step: 5,
            required: false
          },
          {
            id: 'negative_prompt',
            name: 'Negative Prompt',
            description: 'Describe what you do NOT want in the image',
            type: 'text',
            required: false,
            placeholder: 'blurry, distorted, low quality, watermark...'
          },
          {
            id: 'reference_image',
            name: 'Reference Image',
            description: 'Upload an image to use as a reference (optional)',
            type: 'file',
            required: false,
            acceptedFileTypes: ['.jpg', '.jpeg', '.png']
          }
        ]
      },
      'dalle3': {
        id: 'dalle3',
        name: 'DALL-E 3',
        description: 'Advanced AI image generation model by OpenAI with superior understanding of prompts and artistic capabilities.',
        longDescription: `DALL-E 3 is OpenAI's latest text-to-image generation model that represents a significant advancement over its predecessors. This state-of-the-art system excels at generating highly detailed and accurate images based on text prompts with remarkable precision and creativity.

The model demonstrates an exceptional understanding of nuanced text descriptions, spatial relationships, and complex scenes. It can reliably render text within images - a challenge for many image generation systems - and shows improved capabilities for creating photorealistic imagery with accurate human anatomy, coherent scenes, and logical compositions.

DALL-E 3 offers high artistic versatility, capable of producing images in various artistic styles from photorealism to stylized illustrations, painterly effects, and abstract compositions. The model is suitable for concept artists, designers, marketers, content creators, and anyone seeking to visualize ideas quickly and effectively.

The system's architecture ensures better alignment with user intent while maintaining appropriate content policies, making it a powerful yet responsible tool for creative professionals.`,
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
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxMEEzN0YiLz48cGF0aCBkPSJNNjAgNTBIMTQwTDE0MCAxNTBINjBMNjAgNTBaIiBmaWxsPSIjRkZGRkZGIi8+PHBhdGggZD0iTTgwIDcwSDEyMFYxMzBIODBWNzBaIiBmaWxsPSIjMTBBMzdGIi8+PC9zdmc+',
        ],
        parameters: [
          {
            id: 'prompt',
            name: 'Prompt',
            description: 'Describe the image you want to generate',
            type: 'text',
            required: true,
            placeholder: 'A serene landscape with mountains and a lake at sunset, digital art...'
          },
          {
            id: 'size',
            name: 'Size',
            description: 'Select the size of the generated image',
            type: 'select',
            default: '1024x1024',
            required: false,
            options: [
              { value: '1024x1024', label: 'Square (1024x1024)' },
              { value: '1792x1024', label: 'Landscape (1792x1024)' },
              { value: '1024x1792', label: 'Portrait (1024x1792)' }
            ]
          },
          {
            id: 'quality',
            name: 'Quality',
            description: 'Choose between standard and HD quality',
            type: 'select',
            default: 'standard',
            required: false,
            options: [
              { value: 'standard', label: 'Standard' },
              { value: 'hd', label: 'HD' }
            ]
          },
          {
            id: 'style',
            name: 'Style',
            description: 'Select a style for your image',
            type: 'select',
            default: 'vivid',
            required: false,
            options: [
              { value: 'vivid', label: 'Vivid' },
              { value: 'natural', label: 'Natural' }
            ]
          }
        ]
      },
      'kling-ai': {
        id: 'kling-ai',
        name: 'Kling AI',
        description: 'Create professional-quality videos from text prompts in minutes, with advanced motion and animation technology.',
        longDescription: `Kling AI is a cutting-edge text-to-video generation platform that allows users to create professional-quality videos from simple text descriptions. The technology combines advanced motion synthesis, natural language understanding, and state-of-the-art computer graphics to turn your ideas into compelling video content in minutes.

The system excels at producing short-form videos with smooth motions, realistic animations, and coherent scene transitions. It understands complex prompts and can generate a wide variety of video styles from photorealistic footage to animated sequences and stylized content.

Kling AI is particularly useful for marketing professionals, content creators, educators, and businesses looking to produce high-quality video assets without extensive production resources. The platform's strengths include character animation, scene composition, camera movement effects, and maintaining visual consistency throughout generated clips.

Users can further enhance their videos by adding soundtracks, voice-overs, or sound effects through the platform's audio integration capabilities. The system also allows for customization of video parameters such as duration, frame rate, and resolution to suit specific needs.`,
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
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ODRCQkMiLz48cGF0aCBkPSJNNDAgNDBINTBWMTYwSDQwVjQwWiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNjAgNDBIMTYwVjUwSDYwVjQwWiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNjAgMTUwSDE2MFYxNjBINjBWMTUwWiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMTUwIDUwSDE2MFYxNTBIMTUwVjUwWiIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjRkZGRkZGIi8+PHBhdGggZD0iTTkwIDgwTDEyMCAxMDBMOTAgMTIwVjgwWiIgZmlsbD0iIzQ4NEJCQyIvPjwvc3ZnPg==',
        ],
        parameters: [
          {
            id: 'prompt',
            name: 'Prompt',
            description: 'Describe the video you want to generate',
            type: 'text',
            required: true,
            placeholder: 'A cinematic shot of a futuristic city with flying cars and neon lights...'
          },
          {
            id: 'duration',
            name: 'Duration',
            description: 'Length of the video in seconds',
            type: 'slider',
            default: 5,
            min: 3,
            max: 15,
            step: 1,
            required: false
          },
          {
            id: 'resolution',
            name: 'Resolution',
            description: 'Video resolution',
            type: 'select',
            default: '720p',
            required: false,
            options: [
              { value: '480p', label: '480p (SD)' },
              { value: '720p', label: '720p (HD)' },
              { value: '1080p', label: '1080p (Full HD)' }
            ]
          },
          {
            id: 'fps',
            name: 'Frame Rate',
            description: 'Frames per second',
            type: 'select',
            default: '24',
            required: false,
            options: [
              { value: '24', label: '24 FPS (Film)' },
              { value: '30', label: '30 FPS (Standard)' },
              { value: '60', label: '60 FPS (Smooth)' }
            ]
          },
          {
            id: 'style',
            name: 'Visual Style',
            description: 'The overall look and feel of the video',
            type: 'select',
            default: 'cinematic',
            required: false,
            options: [
              { value: 'cinematic', label: 'Cinematic' },
              { value: 'realistic', label: 'Realistic' },
              { value: 'animation', label: 'Animation' },
              { value: 'stylized', label: 'Stylized' }
            ]
          },
          {
            id: 'add_music',
            name: 'Add Background Music',
            description: 'Include AI-generated background music',
            type: 'checkbox',
            default: true,
            required: false
          }
        ]
      },
      'mmaudio': {
        id: 'mmaudio',
        name: 'MMAudio',
        description: 'Generate realistic music, sound effects, and audio compositions with AI-powered audio synthesis technology.',
        longDescription: `MMAudio is a state-of-the-art AI audio generation platform that creates high-quality sound effects, music, and audio compositions from text descriptions. The system leverages deep learning and advanced audio synthesis techniques to produce realistic and customizable audio content for various applications.

The platform excels at generating a wide range of audio types, from ambient soundscapes and environmental effects to music compositions in different genres and instrument-specific sounds. Its natural language interface allows users to describe the desired audio in plain English, making professional sound design accessible to creators without specialized expertise.

MMAudio is particularly valuable for game developers, filmmakers, podcasters, content creators, and multimedia producers seeking to enhance their projects with custom audio. The technology can generate sounds that would be difficult, expensive, or impossible to record naturally, opening new creative possibilities.

The system offers fine-grained control over audio parameters including duration, tempo, intensity, and more. Users can also blend multiple audio elements, create seamless loops, and export in various formats to suit their specific needs.`,
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
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyQTlDNjgiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjYwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
        ],
        parameters: [
          {
            id: 'prompt',
            name: 'Prompt',
            description: 'Describe the audio you want to generate',
            type: 'text',
            required: true,
            placeholder: 'A peaceful ambient soundtrack with gentle piano and light rain sounds...'
          },
          {
            id: 'audio_type',
            name: 'Audio Type',
            description: 'Select the type of audio to generate',
            type: 'select',
            default: 'music',
            required: true,
            options: [
              { value: 'music', label: 'Music' },
              { value: 'sfx', label: 'Sound Effect' },
              { value: 'ambient', label: 'Ambient/Background' },
              { value: 'voice', label: 'Voice' }
            ]
          },
          {
            id: 'duration',
            name: 'Duration',
            description: 'Length of the audio in seconds',
            type: 'slider',
            default: 30,
            min: 5,
            max: 120,
            step: 5,
            required: false
          },
          {
            id: 'tempo',
            name: 'Tempo',
            description: 'Speed of the music (BPM)',
            type: 'slider',
            default: 90,
            min: 60,
            max: 180,
            step: 5,
            required: false
          },
          {
            id: 'mood',
            name: 'Mood',
            description: 'Emotional quality of the audio',
            type: 'select',
            default: 'neutral',
            required: false,
            options: [
              { value: 'happy', label: 'Happy' },
              { value: 'sad', label: 'Sad' },
              { value: 'relaxed', label: 'Relaxed' },
              { value: 'intense', label: 'Intense' },
              { value: 'mysterious', label: 'Mysterious' },
              { value: 'neutral', label: 'Neutral' }
            ]
          },
          {
            id: 'format',
            name: 'Output Format',
            description: 'File format for the generated audio',
            type: 'select',
            default: 'mp3',
            required: false,
            options: [
              { value: 'mp3', label: 'MP3' },
              { value: 'wav', label: 'WAV' },
              { value: 'aiff', label: 'AIFF' }
            ]
          }
        ]
      },
      'shape-e': {
        id: 'shape-e',
        name: 'Shape-E',
        description: 'Generate 3D models from text descriptions or 2D images with AI-powered 3D synthesis technology.',
        longDescription: `Shape-E is an advanced text-to-3D and image-to-3D generation model that creates three-dimensional objects and scenes from simple text descriptions or reference images. This cutting-edge technology bridges the gap between 2D concepts and 3D realization, making professional 3D content creation accessible to everyone.

The system excels at converting natural language descriptions into detailed 3D models with appropriate geometry, textures, and proportions. It can generate a wide variety of objects, characters, environments, and abstract forms based on textual input. The image-to-3D capability also allows users to provide a reference image from which the AI can infer three-dimensional structure and details.

Shape-E is particularly valuable for game developers, product designers, architects, educators, and 3D artists looking to rapidly prototype concepts or generate assets. The technology handles complex spatial relationships and can create models with realistic proportions and details that respect physical constraints.

The output models are optimized for practical use and can be exported in standard 3D formats compatible with popular modeling and rendering software. Users can further refine and customize the generated models as needed for their specific applications.`,
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
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRjk1MDAiLz48cmVjdCB4PSI2MCIgeT0iNjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBmaWxsPSIjRkY5NTAwIi8+PHBhdGggZD0iTTYwIDYwTDEwMCAyMEwxNDAgNjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIvPjwvc3ZnPg==',
        ],
        parameters: [
          {
            id: 'prompt',
            name: 'Prompt',
            description: 'Describe the 3D model you want to generate',
            type: 'text',
            required: true,
            placeholder: 'A futuristic chair with organic curves and metallic finish...'
          },
          {
            id: 'input_type',
            name: 'Input Type',
            description: 'Choose text-to-3D or image-to-3D',
            type: 'select',
            default: 'text',
            required: true,
            options: [
              { value: 'text', label: 'Text-to-3D' },
              { value: 'image', label: 'Image-to-3D' }
            ]
          },
          {
            id: 'reference_image',
            name: 'Reference Image',
            description: 'Upload an image to use as reference (for image-to-3D)',
            type: 'file',
            required: false,
            acceptedFileTypes: ['.jpg', '.jpeg', '.png']
          },
          {
            id: 'complexity',
            name: 'Model Complexity',
            description: 'Set the level of detail for the 3D model',
            type: 'select',
            default: 'medium',
            required: false,
            options: [
              { value: 'low', label: 'Low (Faster)' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High (Slower)' }
            ]
          },
          {
            id: 'format',
            name: 'Output Format',
            description: 'File format for the generated 3D model',
            type: 'select',
            default: 'glb',
            required: false,
            options: [
              { value: 'glb', label: 'GLB' },
              { value: 'obj', label: 'OBJ' },
              { value: 'usdz', label: 'USDZ (for AR)' }
            ]
          },
          {
            id: 'texture_quality',
            name: 'Texture Quality',
            description: 'Set the resolution of textures',
            type: 'select',
            default: '2k',
            required: false,
            options: [
              { value: '1k', label: '1K' },
              { value: '2k', label: '2K' },
              { value: '4k', label: '4K' }
            ]
          }
        ]
      }
    };

    return tools[toolId] || null;
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

  // Handle parameter changes
  const handleParamChange = (paramId: string, value: any) => {
    setParamValues({
      ...paramValues,
      [paramId]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tool) return;
    
    // Check for required parameters
    const missingRequired = tool.parameters?.filter(param => param.required && !paramValues[param.id]);
    
    if (missingRequired && missingRequired.length > 0) {
      alert(`Please fill in the required fields: ${missingRequired.map(p => p.name).join(', ')}`);
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, you would send the parameters to your API
    console.log('Submitting job with parameters:', paramValues);
    
    // Simulate API call
    setTimeout(() => {
      // Redirect to jobs page or show success message
      router.push('/dashboard/history?job=new');
      setIsSubmitting(false);
    }, 2000);
  };

  // Render parameter input based on type
  const renderParameterInput = (param: ToolParameter) => {
    switch (param.type) {
      case 'text':
        return (
          <textarea
            id={param.id}
            value={paramValues[param.id] || ''}
            onChange={(e) => handleParamChange(param.id, e.target.value)}
            placeholder={param.placeholder}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            rows={4}
          />
        );
      
      case 'select':
        return (
          <select
            id={param.id}
            value={paramValues[param.id] || param.default}
            onChange={(e) => handleParamChange(param.id, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            {param.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'slider':
        return (
          <div className="flex items-center space-x-4">
            <input
              id={param.id}
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={paramValues[param.id] || param.default}
              onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[3ch]">
              {paramValues[param.id] || param.default}
            </span>
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={param.id}
              type="checkbox"
              checked={paramValues[param.id] || param.default}
              onChange={(e) => handleParamChange(param.id, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
            />
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor={param.id}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-3 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {param.acceptedFileTypes?.join(', ')} (max 10MB)
                </p>
              </div>
              <input
                id={param.id}
                type="file"
                className="hidden"
                accept={param.acceptedFileTypes?.join(',')}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    // In a real app, you would handle file upload
                    handleParamChange(param.id, e.target.files[0].name);
                  }
                }}
              />
            </label>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render generator form
  const renderGeneratorForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {tool && tool.parameters?.map((param) => (
        <div key={param.id} className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor={param.id}
              className="block text-sm font-medium text-slate-900 dark:text-white"
            >
              {param.name}
              {param.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {param.description && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {param.description}
              </span>
            )}
          </div>
          {renderParameterInput(param)}
        </div>
      ))}
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn btn-primary py-2 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="loading mr-2"></div>
              Processing...
            </>
          ) : (
            <>Generate with {tool?.creditsPerUse} Credits</>
          )}
        </button>
      </div>
    </form>
  );

  // Render examples gallery
  const renderExamplesGallery = () => (
    <div className="space-y-6">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Here are some examples of content generated with {tool?.name}:
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {tool?.samples?.map((sample, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <img
              src={sample}
              alt={`${tool.name} sample ${index + 1}`}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
      
      <div className="text-center pt-4">
        <button
          onClick={() => setActiveTab('generator')}
          className="btn btn-primary"
        >
          Try It Yourself
        </button>
      </div>
    </div>
  );

  // Render about section
  const renderAboutSection = () => (
    <div className="space-y-6">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p>{tool?.longDescription || tool?.description}</p>
        
        <h3>Capabilities</h3>
        <ul>
          {tool?.capabilities.map((capability, index) => (
            <li key={index}>{capability}</li>
          ))}
        </ul>
        
        <h3>Technical Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4>Input Types</h4>
            <ul>
              {tool?.inputTypes.map((type, index) => (
                <li key={index}>{type}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Output Types</h4>
            <ul>
              {tool?.outputTypes.map((type, index) => (
                <li key={index}>{type}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <h3>Credits</h3>
        <p>
          Using this tool costs <strong>{tool?.creditsPerUse} credits</strong> per generation.
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        {isLoading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="loading loading-lg"></div>
          </div>
        ) : !tool ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">AI Tool Not Found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              The AI tool you're looking for could not be found. It may have been removed or the URL is incorrect.
            </p>
            <Link href="/dashboard/tools" className="btn btn-primary">
              Browse All AI Tools
            </Link>
          </div>
        ) : (
          <>
            {/* Tool Header */}
            <div className="mb-8 flex items-start">
              <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 mr-4">
                <img
                  src={tool.icon}
                  alt={tool.name}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {tool.name}
                  </h1>
                  {tool.isNew && (
                    <span className="ml-2 badge badge-primary">New</span>
                  )}
                </div>
                
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  by {tool.provider}
                </div>
                
                <p className="text-slate-600 dark:text-slate-300">
                  {tool.description}
                </p>
                
                <div className="flex items-center mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tool.category)}`}>
                    {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)}
                  </span>
                  
                  <div className="flex items-center text-amber-500 ml-3">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {tool.popularityScore}% rating
                    </span>
                  </div>
                  
                  <div className="ml-3 text-sm font-medium text-primary-600 dark:text-primary-400">
                    {tool.creditsPerUse} credits per use
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`pb-4 border-b-2 font-medium text-sm ${
                    activeTab === 'generator'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  Generator
                </button>
                <button
                  onClick={() => setActiveTab('examples')}
                  className={`pb-4 border-b-2 font-medium text-sm ${
                    activeTab === 'examples'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  Examples
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-4 border-b-2 font-medium text-sm ${
                    activeTab === 'about'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  About
                </button>
              </nav>
            </div>
            
            {/* Main Content */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              {activeTab === 'generator' && renderGeneratorForm()}
              {activeTab === 'examples' && renderExamplesGallery()}
              {activeTab === 'about' && renderAboutSection()}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

ToolDetail.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default ToolDetail;
