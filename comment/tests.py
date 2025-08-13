import pytest
from django.utils import timezone
from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

from comment.models import Comment
from common.sanitizers import sanitize_html


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def user(db):
    return baker.make("backend.User")  # кастомная модель "backend.User"


@pytest.fixture
def other_user(db):
    return baker.make("backend.User")


@pytest.fixture
def superuser(db):
    return baker.make("backend.User", is_superuser=True, is_staff=True)


@pytest.fixture
def post(db, user):
    # bakery сам проставит обязательные поля поста
    return baker.make("post.Post", author=user)


@pytest.fixture
def comment(db, post, user):
    return baker.make(
        Comment,
        post=post,
        author=user,
        body="<p>Hello <img src=x onerror=alert(1)> <a href='javascript:bad()' target='_blank'>link</a></p>",
        created=timezone.now(),
        edited=False,
    )


def _list_url(post):
    # Предполагаемый nested-route: /api/posts/{post_pk}/comments/
    return f"/api/posts/{post.public_id}/comments/"


def _detail_url(post, comment):
    # Предполагаемый nested-route: /api/posts/{post_pk}/comments/{pk}/
    return f"/api/posts/{post.public_id}/comments/{comment.public_id}/"


@pytest.mark.django_db
def test_model_sanitizes_on_save(db, post, user):
    raw = "<p onclick='x'>Hi</p><script>alert(1)</script><a href='javascript:evil()'>x</a>"
    c = Comment(post=post, author=user, body=raw)
    c.save()
    c.refresh_from_db()
    assert "<script" not in c.body
    assert "onclick" not in c.body
    assert "javascript:" not in c.body
    # допустимые теги остаются
    assert "<p>" in c.body and "</p>" in c.body


@pytest.mark.django_db
def test_sanitize_html_anchor_blank_rel():
    html = '<a href="https://ex.com" target="_blank">x</a>'
    out = sanitize_html(html)
    # target="_blank" должен получить rel="noopener noreferrer"
    assert 'rel="' in out and "noopener" in out and "noreferrer" in out


@pytest.mark.django_db
def test_list_filtered_by_post(api, post, user):
    other_post = baker.make("post.Post", author=user)
    # Комментарии к разным постам
    baker.make(Comment, post=post, author=user, _quantity=2)
    baker.make(Comment, post=other_post, author=user, _quantity=3)

    api.force_authenticate(user=user)
    r = api.get(_list_url(post))
    assert r.status_code == status.HTTP_200_OK
    # Только для нужного поста
    assert len(r.data["results"]) == 2
    # Отсортированы по -created (из get_queryset) — проверим, что порядок убывающий
    created_list = [item["created"] for item in r.data["results"]]
    assert created_list == sorted(created_list, reverse=True)


@pytest.mark.django_db
def test_pagination_default_limit(api, post, user):
    baker.make(Comment, post=post, author=user, _quantity=10)
    api.force_authenticate(user=user)
    r = api.get(_list_url(post))
    assert r.status_code == 200
    # Коммент Pagination.default_limit = 4
    assert len(r.data["results"]) == 4
    assert r.data["count"] == 10


@pytest.mark.django_db
def test_create_sets_author_and_post_from_context(api, post, user):
    api.force_authenticate(user=user)
    payload = {
        # author и post read_only в сериализаторе — задаются во ViewSet.perform_create
        "body": "<b>Hi</b><img onerror=1 src=x>"
    }
    r = api.post(_list_url(post), payload, format="json")
    assert r.status_code == status.HTTP_201_CREATED
    # Возвращается уже сериализованная сущность (author — объект UserSerializer)
    assert r.data["author"]["public_id"] == str(user.public_id)
    # Тело очищено
    assert "<img" not in r.data["body"]
    assert "<b>" in r.data["body"]


@pytest.mark.django_db
def test_update_only_author_can_edit_sets_edited_true(api, post, user, comment):
    api.force_authenticate(user=user)
    r = api.patch(_detail_url(post, comment), {"body": "<i>new</i><script>x</script>"}, format="json")
    assert r.status_code == status.HTTP_200_OK
    # Установлен флаг edited
    assert r.data["edited"] is True
    # Очищено
    assert "<script" not in r.data["body"]
    assert "<i>" in r.data["body"]


@pytest.mark.django_db
def test_update_forbidden_for_non_author(api, post, other_user, comment):
    api.force_authenticate(user=other_user)
    r = api.patch(_detail_url(post, comment), {"body": "nope"}, format="json")
    assert r.status_code in (status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
def test_delete_only_author_or_superuser(api, post, user, other_user, comment):
    # не автор — нельзя
    api.force_authenticate(user=other_user)
    r1 = api.delete(_detail_url(post, comment))
    assert r1.status_code in (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND)

    # автор — можно
    api.force_authenticate(user=user)
    r2 = api.delete(_detail_url(post, comment))
    assert r2.status_code == status.HTTP_204_NO_CONTENT

    # superuser видит всё и может управлять
    c2 = baker.make(Comment, post=post, author=user)
    api.force_authenticate(user=baker.make("backend.User", is_superuser=True, is_staff=True))
    r3 = api.delete(_detail_url(post, c2))
    assert r3.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
def test_superuser_queryset_sees_all_comments(api, superuser):
    # создадим по 3 комментария к двум постам
    p1 = baker.make("post.Post", author=baker.make("backend.User"))
    p2 = baker.make("post.Post", author=baker.make("backend.User"))
    baker.make(Comment, post=p1, author=baker.make("backend.User"), _quantity=3)
    baker.make(Comment, post=p2, author=baker.make("backend.User"), _quantity=3)

    api.force_authenticate(user=superuser)
    # у суперюзера get_queryset не требует post_pk, можно дернуть любой пост_pk — вернёт все
    r = api.get(_list_url(p1))
    assert r.status_code == 200
    assert r.data["count"] == 6


@pytest.mark.django_db
def test_validate_post_is_immutable_on_update(api, post, user, comment):
    api.force_authenticate(user=user)
    # Пытаемся подменить пост у существующего комментария — сериализатор должен игнорировать
    new_post = baker.make("post.Post", author=user)
    r = api.patch(_detail_url(post, comment), {"post": str(new_post.public_id), "body": "ok"}, format="json")
    assert r.status_code == 200
    # перечитываем из БД
    comment.refresh_from_db()
    assert comment.post_id == post.id


@pytest.mark.django_db
def test_body_is_sanitized_in_serializer_on_create(api, post, user):
    api.force_authenticate(user=user)
    payload = {
        "body": "<pre>good</pre><style>.x{}</style><a href='data:text/html;base64,xxx'>bad</a>"
    }
    r = api.post(_list_url(post), payload, format="json")
    assert r.status_code == 201
    body = r.data["body"]
    assert "<style" not in body
    assert "data:" not in body
    assert "<pre>" in body and "</pre>" in body
