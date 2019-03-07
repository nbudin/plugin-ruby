# frozen_string_literal: true

class ArrayTest < Minitest::Test
  def test_basics
    assert_equal_join '', []
    assert_equal_join '1, 2, 3', [1, 2, 3]
    assert_equal_join 'a, b, c', ['a', 'b', 'c']
    assert_equal_join 'a, b c, d', ['a', 'b c', 'd']
    assert_equal_join 'a, b, c', [:a, :b, :c]
    assert_equal_join 'a, b c, d', [:a, :'b c', :d]
  end

  def test_literals
    assert_equal_join 'a, b, c', %w[a b c]
    assert_equal_join 'a, b, c', %i[a b c]
  end

  # rubocop:disable Style/UnneededInterpolation
  def test_string_arrays_with_interpolation
    interp = 'b'
    assert_equal_join 'a, b, c', ['a', "#{interp}", 'c']
  end
  # rubocop:enable Style/UnneededInterpolation

  def test_literals_with_interpolation
    foo = 'foo'
    bar = 'bar'
    baz = 'baz'

    assert_equal_join 'afooa, bbarb, cbazc', %W[a#{foo}a b#{bar}b c#{baz}c]
    assert_equal_join 'afooa, bbarb, cbazc', %I[a#{foo}a b#{bar}b c#{baz}c]
  end

  # rubocop:disable Lint/UnneededSplatExpansion
  def test_splats
    assert_equal_join "1, 2, 3, 4, 5, 6", [1, 2, *[3, 4], 5, 6]
  end
  # rubocop:enable Lint/UnneededSplatExpansion

  def test_long_elements
    super_super_super_super_super_super_long = 'foo'
    arr = [
      super_super_super_super_super_super_long,
      super_super_super_super_super_super_long, [
        super_super_super_super_super_super_long
      ]
    ]

    assert_equal_join('foo, foo, foo', arr)
  end

  def test_reference
    arr = %w[foo bar]

    assert_equal 'bar', arr[1]
  end

  def test_reference_assignment
    arr = %w[foo bar]
    arr[1] = 'baz'

    assert_equal 'baz', arr[1]
  end

  def test_comments_within_reference_assignment
    arr = %w[foo bar]
    arr[1] = [
      # abc
      %w[abc]
    ]

    assert_equal_join 'abc', arr[1]
  end

  def test_dynamic_reference
    arr = [1, 2, 3]
    idx = 0

    assert_equal 1, arr[idx]
  end

  private

  def assert_equal_join(expected, object)
    assert_equal expected, object.join(', ')
  end

  def assert_equal_str(expected, object)
    assert_equal expected, object.to_s
  end
end
