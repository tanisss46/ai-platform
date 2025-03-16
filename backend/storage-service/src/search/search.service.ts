import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from '../content/schemas/content.schema';

// Interface for search filters
export interface ContentSearchFilter {
  term?: string;
  mediaTypes?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  parentFolderId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Interface for aggregation results
export interface ContentAggregation {
  fileTypes: { type: string; count: number }[];
  sizeByType: { type: string; totalSize: number }[];
  recentActivity: { date: string; count: number }[];
  topTags: { tag: string; count: number }[];
  totalCount: number;
  totalSize: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {}

  /**
   * Advanced search function with multiple filters
   */
  async search(userId: string, filter: ContentSearchFilter) {
    try {
      const {
        term,
        mediaTypes = [],
        dateFrom,
        dateTo,
        tags = [],
        metadata = {},
        parentFolderId,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortDirection = 'desc',
      } = filter;

      // Build the query
      const query: any = { ownerId: userId };

      // Text search
      if (term && term.trim()) {
        query.$or = [
          { name: { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } },
        ];
      }

      // Filter by media type
      if (mediaTypes.length > 0) {
        query.type = { $in: mediaTypes };
      }

      // Date range filter
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = dateFrom;
        if (dateTo) query.createdAt.$lte = dateTo;
      }

      // Tags filter - all tags must be present
      if (tags.length > 0) {
        query.tags = { $all: tags };
      }

      // Parent folder filter
      if (parentFolderId) {
        query.parentFolderId = parentFolderId;
      }

      // Metadata filters
      Object.entries(metadata).forEach(([key, value]) => {
        query[`metadata.${key}`] = value;
      });

      // Execute query with pagination and sorting
      const skip = (page - 1) * limit;
      const sortOptions: Record<string, 1 | -1> = {
        [sortBy]: sortDirection === 'asc' ? 1 : -1,
      };

      // Fetch results
      const results = await this.contentModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec();

      // Get total count for pagination
      const total = await this.contentModel.countDocuments(query);

      return {
        items: results,
        pagination: {
          page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Search error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all unique tags used by a user
   */
  async getUserTags(userId: string): Promise<string[]> {
    try {
      const result = await this.contentModel.aggregate([
        { $match: { ownerId: userId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags' } },
        { $sort: { _id: 1 } },
      ]);

      return result.map(item => item._id);
    } catch (error) {
      this.logger.error(`Get user tags error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get AI-related metadata fields used across user's content
   */
  async getMetadataFields(userId: string): Promise<string[]> {
    try {
      // This is a simplified approach - in a real app, you might need 
      // to handle nested metadata fields differently
      const result = await this.contentModel.aggregate([
        { $match: { ownerId: userId } },
        { $project: { metadataKeys: { $objectToArray: '$metadata' } } },
        { $unwind: '$metadataKeys' },
        { $group: { _id: '$metadataKeys.k' } },
        { $sort: { _id: 1 } },
      ]);

      return result.map(item => item._id);
    } catch (error) {
      this.logger.error(`Get metadata fields error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get aggregated statistics about user's content
   */
  async getContentAggregations(userId: string): Promise<ContentAggregation> {
    try {
      // File type distribution
      const fileTypes = await this.contentModel.aggregate([
        { $match: { ownerId: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // Storage size by type
      const sizeByType = await this.contentModel.aggregate([
        { $match: { ownerId: userId } },
        { $group: { _id: '$type', totalSize: { $sum: '$size' } } },
        { $sort: { totalSize: -1 } },
      ]);

      // Recent activity
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const recentActivity = await this.contentModel.aggregate([
        { 
          $match: { 
            ownerId: userId,
            createdAt: { $gte: lastMonth } 
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
      ]);

      // Top tags
      const topTags = await this.contentModel.aggregate([
        { $match: { ownerId: userId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      // Totals
      const totals = await this.contentModel.aggregate([
        { $match: { ownerId: userId } },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            totalSize: { $sum: '$size' }
          }
        }
      ]);

      return {
        fileTypes: fileTypes.map(item => ({ type: item._id, count: item.count })),
        sizeByType: sizeByType.map(item => ({ type: item._id, totalSize: item.totalSize })),
        recentActivity: recentActivity.map(item => ({ date: item._id, count: item.count })),
        topTags: topTags.map(item => ({ tag: item._id, count: item.count })),
        totalCount: totals.length > 0 ? totals[0].totalCount : 0,
        totalSize: totals.length > 0 ? totals[0].totalSize : 0,
      };
    } catch (error) {
      this.logger.error(`Get aggregations error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search content by AI model and parameters
   */
  async searchByAIModel(userId: string, model: string, parameters?: Record<string, any>) {
    try {
      const query: any = { 
        ownerId: userId,
        'metadata.model': model 
      };

      // Add parameter filters if provided
      if (parameters) {
        Object.entries(parameters).forEach(([key, value]) => {
          query[`metadata.parameters.${key}`] = value;
        });
      }

      return await this.contentModel.find(query).sort({ createdAt: -1 }).exec();
    } catch (error) {
      this.logger.error(`Search by AI model error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find similar content based on tags and metadata
   */
  async findSimilarContent(contentId: string, userId: string, limit = 5) {
    try {
      // Get the reference content
      const content = await this.contentModel.findOne({ 
        _id: contentId, 
        ownerId: userId 
      });

      if (!content) {
        return [];
      }

      // If there are no tags, use content type for similarity
      if (!content.tags || content.tags.length === 0) {
        return this.contentModel.find({
          _id: { $ne: contentId },
          ownerId: userId,
          type: content.type
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
      }

      // Find content with similar tags
      const similarContent = await this.contentModel.aggregate([
        {
          $match: {
            _id: { $ne: content._id },
            ownerId: userId,
            tags: { $in: content.tags }
          }
        },
        // Calculate similarity score based on tag overlap
        {
          $addFields: {
            commonTags: {
              $size: {
                $setIntersection: ['$tags', content.tags]
              }
            }
          }
        },
        { $sort: { commonTags: -1, createdAt: -1 } },
        { $limit: limit }
      ]);

      return similarContent;
    } catch (error) {
      this.logger.error(`Find similar content error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
