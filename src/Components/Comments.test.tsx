import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';
import posts from '../data/posts.json';

afterEach(cleanup);

const [first, second] = posts;

const commentsOn = (title: string) => screen.getByRole('region', { name: `Comments on ${title}` });

const inputFor = (title: string) =>
  screen.getByRole<HTMLInputElement>('textbox', { name: `Add a comment on ${title}` });

const postComment = (title: string, text: string) => {
  fireEvent.change(inputFor(title), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: `Post comment on ${title}` }));
};

it('renders a labelled comment input and submit button under every photo', () => {
  render(<App />);
  for (const post of posts) {
    const region = commentsOn(post.title);
    expect(
      within(region).getByRole('textbox', { name: `Add a comment on ${post.title}` }),
    ).toBeTruthy();
    expect(
      within(region)
        .getByRole('button', { name: `Post comment on ${post.title}` })
        .getAttribute('type'),
    ).toBe('submit');
  }
});

it('lists comments under the photo in the order they were added', () => {
  render(<App />);
  postComment(first.title, 'So cute!');
  postComment(first.title, 'Look at those ears');

  const items = within(commentsOn(first.title)).getAllByRole('listitem');
  expect(items.map((item) => item.textContent)).toEqual(['So cute!', 'Look at those ears']);
});

it('keeps comments on the photo they were added to', () => {
  render(<App />);
  postComment(first.title, 'Only on the first photo');

  expect(within(commentsOn(first.title)).getByText('Only on the first photo')).toBeTruthy();
  expect(within(commentsOn(second.title)).queryAllByRole('listitem')).toHaveLength(0);
  expect(screen.getAllByText('Only on the first photo')).toHaveLength(1);
});

it('clears the input after a successful submit', () => {
  render(<App />);
  postComment(first.title, 'Hello hippo');
  expect(inputFor(first.title).value).toBe('');
});

it('posts the comment on form submit (so Enter works)', () => {
  render(<App />);
  const input = inputFor(first.title);
  fireEvent.change(input, { target: { value: 'Posted with Enter' } });
  fireEvent.submit(input.form!);

  expect(within(commentsOn(first.title)).getByText('Posted with Enter')).toBeTruthy();
  expect(input.value).toBe('');
});

it('caps comments at 280 characters and shows a live count', () => {
  render(<App />);
  const input = inputFor(first.title);
  expect(input.maxLength).toBe(280);

  fireEvent.change(input, { target: { value: 'Hello' } });
  const counter = document.getElementById(input.getAttribute('aria-describedby')!);
  expect(counter?.textContent).toBe('5/280 characters');
});

it('keeps comments outside the figure so the caption stays its last child', () => {
  render(<App />);
  const figures = screen.getAllByRole('figure');
  expect(figures).toHaveLength(posts.length);
  for (const figure of figures) {
    expect(figure.lastElementChild?.tagName).toBe('FIGCAPTION');
    expect(within(figure).queryByRole('region')).toBeNull();
  }
});

it('ignores empty or whitespace-only comments', () => {
  render(<App />);
  postComment(first.title, '   ');
  expect(within(commentsOn(first.title)).queryAllByRole('listitem')).toHaveLength(0);
});

it('keeps the heart toggle and About panel working', () => {
  render(<App />);
  postComment(first.title, 'Still works');

  const [photoButton] = screen.getAllByRole('button', { pressed: false });
  fireEvent.click(photoButton);
  expect(photoButton.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getAllByLabelText('Liked')).toHaveLength(1);

  fireEvent.click(screen.getByRole('link', { name: 'About' }));
  expect(screen.getByText(/Click on a baby hippo image to like it!/)).toBeTruthy();
});
