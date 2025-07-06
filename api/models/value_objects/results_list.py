from typing import List, TypeVar, Generic

T = TypeVar('T')


class ResultsList(Generic[T]):
    def __init__(self, items: List[T], total: int, pages: int, current_page: int):
        self.items = items
        self.total = total
        self.pages = pages
        self.current_page = current_page

    def to_dict(self) -> dict:
        return {
            'items': self.items,
            'total': self.total,
            'pages': self.pages,
            'current_page': self.current_page
        }
