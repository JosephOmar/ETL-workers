from fastapi import FastAPI, Depends
from app.routers import workers, schedules, attendance, reports, sla_breached
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import get_session
from app.database.migrate import run_migrations
from contextlib import asynccontextmanager
from typing import Annotated
from sqlmodel.ext.asyncio.session import AsyncSession


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("▶ Ejecutando migraciones de base de datos...")
    run_migrations()
    print("✅ Migraciones completadas.")
    yield

app = FastAPI(
    title="ETL Workers",
    version="1.0.0",
    debug=True,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4321",
        "https://gtr-cx-glovo-es.netlify.app",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workers.router)
app.include_router(schedules.router)
app.include_router(attendance.router)
app.include_router(reports.router)
app.include_router(sla_breached.router)


SessionDep = Annotated[AsyncSession, Depends(get_session)]