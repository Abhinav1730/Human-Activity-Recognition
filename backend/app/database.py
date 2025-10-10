"""
MongoDB database connection and utilities
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from .config import settings


class Database:
    """MongoDB database manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(settings.mongo_uri)
        self.db = self.client[settings.mongo_db_name]
        
        # Create indexes
        await self._create_indexes()
        print(f"✓ Connected to MongoDB: {settings.mongo_db_name}")
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("✓ Disconnected from MongoDB")
    
    async def _create_indexes(self):
        """Create database indexes for performance"""
        # Sessions indexes
        await self.db.sessions.create_index("user_id")
        await self.db.sessions.create_index("started_at")
        
        # Predictions indexes
        await self.db.predictions.create_index("session_id")
        await self.db.predictions.create_index("timestamp")
        
        # Insights indexes
        await self.db.insights.create_index("session_id")
        await self.db.insights.create_index("generated_at")


# Global database instance
db = Database()

