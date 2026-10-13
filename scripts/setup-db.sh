#!/bin/bash

# 创建数据库目录
mkdir -p data/db

# 确保目录有正确的权限
chmod 755 data/db

# 如果数据库文件不存在，创建一个空的数据库文件
touch data/db/sqlite.db
chmod 644 data/db/sqlite.db

echo "Database directory and file setup completed." 