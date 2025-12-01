# 使用官方 Node.js 镜像作为基础镜像
FROM node:16

# 设置工作目录
WORKDIR /usr/src/app

# 将 package.json 和 package-lock.json 复制到容器中
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 将应用的源代码复制到容器中
COPY . .

# 暴露应用程序的端口
EXPOSE 3000

# 启动应用程序
CMD ["npm", "start"]
